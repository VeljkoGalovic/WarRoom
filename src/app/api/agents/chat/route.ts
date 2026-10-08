import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveAgentProviderConfig, buildApiUrl, getProviderHeaders, AgentProviderConfig } from "@/lib/providers";
import { assembleSystemPrompt, Channel, createPromptAssemblyInput } from "@/lib/prompt-assembly";
import { searchMemories, extractAndStoreMemories, formatMemoriesForPrompt } from "@/lib/memory";

// Timeout for upstream provider calls (30 seconds)
const UPSTREAM_TIMEOUT_MS = 30_000;

// Log provider failure with context (never logs API keys)
function logProviderFailure(context: {
  agentId: string;
  agentName: string;
  providerBaseUrl: string;
  status?: number;
  error: unknown;
  requestBody?: unknown;
}) {
  const { agentId, agentName, providerBaseUrl, status, error, requestBody } = context;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const truncatedBody = requestBody
    ? JSON.stringify(requestBody).slice(0, 500)
    : "none";

  console.error(
    `[PROVIDER ERROR] agentId=${agentId} agentName="${agentName}" ` +
    `providerBaseUrl="${providerBaseUrl}" status=${status ?? "unknown"} ` +
    `error="${errorMessage}" requestBody=${truncatedBody}`
  );
}

async function fetchProviderWithTimeout(
  providerConfig: AgentProviderConfig,
  endpoint: string,
  options: RequestInit = {},
  signal: AbortSignal,
  timeoutMs = UPSTREAM_TIMEOUT_MS
) {
  // Create a timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  // Combine the external signal with our timeout signal
  const combinedSignal = AbortSignal.any([signal, timeoutController.signal]);

  try {
    const response = await fetch(buildApiUrl(providerConfig, endpoint), {
      ...options,
      headers: {
        ...getProviderHeaders(providerConfig),
        ...options.headers,
      },
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      if (signal.aborted) {
        throw new Error("Client disconnected");
      }
      throw new Error("Upstream timeout");
    }
    throw error;
  }
}

export async function POST(request: Request) {
  // Create an AbortSignal that triggers when the client disconnects
  const clientSignal = request.signal;

  try {
    const body = await request.json();
    const { agentId, message, model, channel = "internal", overrides } = body;

    if (!message || !agentId || !model) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate channel
    const validChannels: Channel[] = ["internal", "telegram", "external"];
    if (!validChannels.includes(channel)) {
      return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
    }

    // Get agent details
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get user for activity log
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 400 });
    }

    const providerConfig = resolveAgentProviderConfig(agent);

    // Log user message
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        agentId,
        category: "CHAT",
        message,                              // the user's message
        metadata: { role: "user" },           // no agentId here — it's in the column now
      },
    });

    // Search for relevant memories
    const memories = await searchMemories(agentId, message, {
      limit: 5,
      threshold: 0.3,
      userId: user.id,
    });

    // Assemble system prompt using new prompt assembly (with channel overlay, overrides, and memories)
    const assembledPrompt = assembleSystemPrompt(createPromptAssemblyInput(
      {
        name: agent.name,
        rank: agent.rank,
        role: agent.role,
        identity: agent.identity,
        operationalPrompt: agent.operationalPrompt,
        systemPrompt: agent.systemPrompt,
      },
      channel,
      {
        taskDescription: message,
        overrides: overrides || undefined,
        memories: formatMemoriesForPrompt(memories),
      }
    ));

    // Determine model and params (allow override)
    const finalModel = overrides?.model || providerConfig.model;
    const temperature = overrides?.temperature ?? 0.7;
    const maxTokens = overrides?.maxTokens ?? 4096;

    // Prepare request body for upstream
    const upstreamBody = {
      model: finalModel,
      messages: [
        { role: "system", content: assembledPrompt },
        { role: "user", content: message },
      ],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    };

    // Call upstream provider - fully resolve before streaming
    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetchProviderWithTimeout(
        providerConfig,
        "/chat/completions",
        {
          method: "POST",
          body: JSON.stringify(upstreamBody),
        },
        clientSignal
      );
    } catch (error) {
      // Handle timeout or client disconnect before we even get a response
      if (error instanceof Error) {
        if (error.message === "Upstream timeout") {
          logProviderFailure({
            agentId,
            agentName: agent.name,
            providerBaseUrl: providerConfig.baseUrl,
            error: "Upstream timeout after 30s",
            requestBody: upstreamBody,
          });
          return NextResponse.json(
            { error: "Provider timeout", details: "The model did not respond in time" },
            { status: 504 }
          );
        }
        if (error.message === "Client disconnected") {
          // Client disconnected before we could respond - just log and return
          console.log(`[CHAT] Client disconnected before upstream response for agent ${agentId}`);
          return new Response(null, { status: 499 }); // 499 = Client Closed Request
        }
      }
      // Other network errors
      logProviderFailure({
        agentId,
        agentName: agent.name,
        providerBaseUrl: providerConfig.baseUrl,
        error,
        requestBody: upstreamBody,
      });
      return NextResponse.json(
        { error: "Provider unavailable", details: "Failed to reach the model provider" },
        { status: 502 }
      );
    }

    // Validate upstream response status before streaming
    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      logProviderFailure({
        agentId,
        agentName: agent.name,
        providerBaseUrl: providerConfig.baseUrl,
        status: upstreamResponse.status,
        error: `HTTP ${upstreamResponse.status}: ${errorText}`,
        requestBody: upstreamBody,
      });

      // Map provider errors to appropriate client status codes
      let status = 502;
      let errorCode = "Provider error";
      let details = "The model provider returned an error";

      if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
        status = 502;
        errorCode = "Provider authentication failed";
        details = "Invalid or missing API key for the model provider";
      } else if (upstreamResponse.status === 404) {
        status = 502;
        errorCode = "Model not found";
        details = `The model "${providerConfig.model}" was not found at the provider`;
      } else if (upstreamResponse.status === 429) {
        status = 503;
        errorCode = "Provider rate limited";
        details = "The model provider is rate limiting requests";
      } else if (upstreamResponse.status >= 500) {
        status = 502;
        errorCode = "Provider server error";
        details = "The model provider experienced an internal error";
      }

      return NextResponse.json(
        { error: errorCode, details, providerStatus: upstreamResponse.status },
        { status }
      );
    }

    // Upstream is valid - now create the streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = upstreamResponse.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            while (true) {
              // Check if client disconnected
              if (clientSignal.aborted) {
                console.log(`[CHAT] Client disconnected during streaming for agent ${agentId}`);
                break;
              }

              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content || "";
                    if (content) {
                      fullResponse += content;
                      controller.enqueue(encoder.encode(content));
                    }
                  } catch {
                    // Ignore parse errors in streaming chunks
                  }
                }
              }
            }
          }

          // Log assistant response (non-blocking)
          if (fullResponse) {
            prisma.activityLog.create({
              data: {
                userId: user.id,
                category: "CHAT",
                message: `${agent.name} → User: ${fullResponse}`,
                metadata: { agentId, role: "assistant" },
              },
            }).catch((err) => console.error("Failed to log assistant response:", err));

            // Extract and store memories from this conversation
            const conversation = [
              { role: "user", content: message },
              { role: "assistant", content: fullResponse },
            ];
            extractAndStoreMemories(agentId, user.id, conversation).catch(
              (err) => console.error("Failed to extract memories:", err)
            );
          }

          controller.close();
        } catch (error) {
          // Only log if not a client disconnect
          if (!clientSignal.aborted) {
            console.error("Stream error:", error);
            controller.error(error);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Failed to process chat:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}