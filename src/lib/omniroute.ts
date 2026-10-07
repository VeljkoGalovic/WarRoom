/**
 * OmniRoute Service Utility
 *
 * Configured with OpenAI-compatible API pointing to OmniRoute endpoint
 * Defaults to free NVIDIA NIM models
 */

const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || "https://api.omniroute.ai/v1";
const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || "";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
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

/**
 * Default NVIDIA NIM model endpoints available via OmniRoute
 */
export const NVIDIA_MODELS = {
  "llama-3.1-nemotron-70b-instruct": "nvidia/llama-3.1-nemotron-70b-instruct",
  "nemotron-3-ultra": "nvidia/nemotron-3-ultra",
  "code-llama-70b-instruct": "nvidia/code-llama-70b-instruct",
  "mistral-7b-instruct": "nvidia/mistral-7b-instruct-v0.3",
  "mixtral-8x7b-instruct": "nvidia/mixtral-8x7b-instruct-v0.1",
} as const;

export type NvidiaModel = keyof typeof NVIDIA_MODELS;

/**
 * Chat completion with streaming support for tactical dispatch
 */
export async function streamChatCompletion(
  model: string,
  messages: ChatMessage[],
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const finalMessages = systemPrompt
    ? [{ role: "system" as const, content: systemPrompt }, ...messages]
    : messages;

  const response = await fetchOmniroute("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model,
      messages: finalMessages,
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
            const parsed: ChatCompletionChunk = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              onChunk?.(content);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }

  return fullResponse;
}

/**
 * Non-streaming chat completion for quick queries
 */
export async function chatCompletion(
  model: string,
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const finalMessages = systemPrompt
    ? [{ role: "system" as const, content: systemPrompt }, ...messages]
    : messages;

  const response = await fetchOmniroute("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model,
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  const data: ChatCompletionResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Get model display info for agent roster
 */
export function getModelInfo(modelEndpoint: string) {
  const modelKey = modelEndpoint as NvidiaModel;
  return {
    name: modelEndpoint,
    displayName: modelEndpoint.split("/").pop()?.replace(/-/g, " ").toUpperCase() || modelEndpoint,
    provider: "NVIDIA NIM",
  };
}