import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || "https://api.omniroute.ai/v1";
const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || "";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function fetchOmniroute(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${OMNIROUTE_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${OMNIROUTE_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OmniRoute API error: ${response.status} ${error}`);
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, message, systemPrompt, model } = body;

    if (!message || !agentId || !model) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Log user message
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        category: "CHAT",
        message: `User → ${agent.name}: ${message}`,
        metadata: { agentId, role: "user" },
      },
    });

    // Create stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetchOmniroute("/chat/completions", {
            method: "POST",
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt || agent.systemPrompt },
                { role: "user", content: message },
              ],
              stream: true,
              temperature: 0.7,
              max_tokens: 4096,
            }),
          });

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullResponse = "";

          if (reader) {
            while (true) {
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
                    // Ignore parse errors
                  }
                }
              }
            }
          }

          // Log assistant response
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              category: "CHAT",
              message: `${agent.name} → User: ${fullResponse}`,
              metadata: { agentId, role: "assistant" },
            },
          });

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
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