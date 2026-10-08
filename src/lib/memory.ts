/**
 * Memory Service
 *
 * Handles storing, retrieving, and searching agent memories using pgvector.
 */

import { prisma } from "./prisma";
import { generateEmbedding, cosineSimilarity, EMBEDDING_DIMENSION } from "./embeddings";

export interface MemoryRecord {
  id: string;
  content: string;
  agentId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  similarity?: number;
}

export interface CreateMemoryInput {
  content: string;
  agentId: string;
  userId: string;
}

/**
 * Create a new memory with embedding
 */
export async function createMemory(input: CreateMemoryInput): Promise<MemoryRecord> {
  const embedding = await generateEmbedding(input.content);

  // Convert embedding to PostgreSQL vector format
  const vectorString = `[${embedding.join(",")}]`;

  const memory = await prisma.$queryRawUnsafe<MemoryRecord[]>(`
    INSERT INTO "Memory" (id, content, embedding, "agentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2::vector, $3, $4, NOW(), NOW())
    RETURNING id, content, "agentId", "userId", "createdAt", "updatedAt"
  `, input.content, vectorString, input.agentId, input.userId);

  return memory[0];
}

/**
 * Search memories by semantic similarity
 */
export async function searchMemories(
  agentId: string,
  query: string,
  options?: {
    limit?: number;
    threshold?: number;
    userId?: string;
  }
): Promise<MemoryRecord[]> {
  const { limit = 5, threshold = 0.3, userId } = options || {};

  const queryEmbedding = await generateEmbedding(query);
  const vectorString = `[${queryEmbedding.join(",")}]`;

  // Build query with optional userId filter
  let whereClause = `"agentId" = $1`;
  const params: (string | number)[] = [agentId];

  if (userId) {
    whereClause += ` AND "userId" = $2`;
    params.push(userId);
  }

  const memories = await prisma.$queryRawUnsafe<MemoryRecord[]>(`
    SELECT id, content, "agentId", "userId", "createdAt", "updatedAt",
           1 - (embedding <=> $${params.length + 1}::vector) AS similarity
    FROM "Memory"
    WHERE ${whereClause}
      AND 1 - (embedding <=> $${params.length + 1}::vector) > $${params.length + 2}
    ORDER BY similarity DESC
    LIMIT $${params.length + 3}
  `, ...params, vectorString, threshold, limit);

  return memories;
}

/**
 * Get recent memories for an agent (fallback when no query)
 */
export async function getRecentMemories(
  agentId: string,
  limit: number = 10,
  userId?: string
): Promise<MemoryRecord[]> {
  let whereClause = `"agentId" = $1`;
  const params: (string | number)[] = [agentId, limit];

  if (userId) {
    whereClause += ` AND "userId" = $2`;
    params.push(userId);
  }

  const memories = await prisma.$queryRawUnsafe<MemoryRecord[]>(`
    SELECT id, content, "agentId", "userId", "createdAt", "updatedAt"
    FROM "Memory"
    WHERE ${whereClause}
    ORDER BY "createdAt" DESC
    LIMIT $${userId ? 3 : 2}
  `, ...params);

  return memories;
}

/**
 * Extract memories from conversation and store them
 * Called after each agent interaction
 */
export async function extractAndStoreMemories(
  agentId: string,
  userId: string,
  conversation: { role: string; content: string }[]
): Promise<void> {
  // Simple heuristic: store user messages that look like facts, decisions, or preferences
  const memoryWorthy = conversation.filter(msg =>
    msg.role === "user" &&
    msg.content.length > 50 &&
    (msg.content.includes("remember") ||
     msg.content.includes("prefer") ||
     msg.content.includes("decided") ||
     msg.content.includes("note") ||
     msg.content.includes("important") ||
     msg.content.includes("always") ||
     msg.content.includes("never") ||
     msg.content.includes("rule") ||
     msg.content.includes("habit") ||
     msg.content.includes("goal"))
  );

  for (const msg of memoryWorthy.slice(0, 3)) { // Limit to 3 per interaction
    try {
      await createMemory({
        content: `User context: ${msg.content}`,
        agentId,
        userId,
      });
    } catch (error) {
      console.warn("Failed to store memory:", error);
    }
  }
}

/**
 * Format memories for prompt injection
 */
export function formatMemoriesForPrompt(memories: MemoryRecord[]): string[] {
  return memories.map(m => `[Memory: ${m.createdAt.toISOString().split("T")[0]}] ${m.content}`);
}