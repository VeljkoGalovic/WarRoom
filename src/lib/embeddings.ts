/**
 * Embeddings Module
 *
 * Generates vector embeddings using OmniRoute's embedding endpoint.
 * Falls back to a deterministic hash-based embedding for offline testing.
 */

const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/home";
const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || "";

// Embedding dimension for gemini
export const EMBEDDING_DIMENSION = 3072;

/**
 * Generate embedding for text using OmniRoute
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Normalize text
  const normalizedText = text.trim().slice(0, 8000); // Limit length

  if (!normalizedText) {
    return new Array(EMBEDDING_DIMENSION).fill(0);
  }

  try {
    const response = await fetch(`${OMNIROUTE_BASE_URL}/v1/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(OMNIROUTE_API_KEY ? { "Authorization": `Bearer ${OMNIROUTE_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.EMBEDDING_MODEL || "pollinations/openai/text-embedding-3-small",
        input: normalizedText,
      }),
      // 30 second timeout
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.warn(`Embedding API returned ${response.status}, falling back to hash`);
      return hashEmbedding(normalizedText);
    }

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      console.warn("Invalid embedding response, falling back to hash");
      return hashEmbedding(normalizedText);
    }

    // Validate dimension
    if (embedding.length !== EMBEDDING_DIMENSION) {
      console.warn(`Embedding dimension mismatch: got ${embedding.length}, expected ${EMBEDDING_DIMENSION}`);
      return hashEmbedding(normalizedText);
    }

    return embedding;
  } catch (error) {
    console.warn("Embedding request failed, falling back to hash:", error);
    return hashEmbedding(normalizedText);
  }
}

/**
 * Deterministic hash-based embedding for offline/testing use.
 * Not semantically meaningful but deterministic for testing.
 */
function hashEmbedding(text: string): number[] {
  const embedding = new Array(EMBEDDING_DIMENSION).fill(0);

  // Simple deterministic hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Use hash to seed a simple PRNG for deterministic pseudo-random values
  let seed = Math.abs(hash);
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    // Simple LCG
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    // Normalize to [-1, 1]
    embedding[i] = (seed / 4294967296) * 2 - 1;
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

/**
 * Compute cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
