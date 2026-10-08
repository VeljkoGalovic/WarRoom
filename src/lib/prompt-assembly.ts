/**
 * Prompt Assembly Module
 *
 * Assembles the final system prompt from agent identity, operational prompt,
 * memories, and channel overlays.
 */

export type Channel = "internal" | "telegram" | "external";

export interface PromptAssemblyInput {
  agent: {
    name: string;
    rank: string;
    role: string;
    identity?: string | null;
    operationalPrompt?: string | null;
    systemPrompt: string; // Legacy fallback
  };
  channel: Channel;
  taskDescription?: string;
  memories?: string[];
  // Per-request overrides (optional)
  overrides?: {
    identity?: string;
    operationalPrompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

/**
 * Channel overlay instructions
 */
const CHANNEL_OVERLAYS: Record<Channel, string> = {
  internal: `
[CHANNEL: INTERNAL COMMAND CHANNEL]
You are speaking directly to the Commander in the War Room. Maintain your full persona voice,
military terminology, and tactical communication style. Use your rank insignia, operational
jargon, and character-appropriate mannerisms. The Commander expects you to be in character.`,

  telegram: `
[CHANNEL: TELEGRAM RELAY]
You are responding via a Telegram relay to the Commander. Preserve your expertise and
analytical framework, but strip persona voice. Output neutral, professional language.
Do NOT use: rank titles, military jargon, character catchphrases, or in-character mannerisms.
DO: Provide clear, structured, actionable responses suitable for a messaging interface.`,

  external: `
[CHANNEL: EXTERNAL COMMUNICATION]
You are producing output intended for external recipients (emails, documents, briefings).
COMPLETELY STRIP persona voice. Output only neutral, professional, business-appropriate language.
No military ranks, no tactical jargon, no character voice. Pure professional communication.`,
};

/**
 * Assemble the final system prompt for an agent call.
 */
export function assembleSystemPrompt(input: PromptAssemblyInput): string {
  const { agent, channel, taskDescription, memories = [], overrides = {} } = input;

  // Determine identity text (prefer override, then explicit identity, fall back to systemPrompt)
  const identityText = overrides.identity?.trim()
    ? overrides.identity.trim()
    : agent.identity?.trim()
      ? agent.identity.trim()
      : extractIdentityFromLegacyPrompt(agent.systemPrompt, agent);

  // Determine operational prompt (prefer override, then explicit, fall back to role-based default)
  const operationalText = overrides.operationalPrompt?.trim()
    ? overrides.operationalPrompt.trim()
    : agent.operationalPrompt?.trim()
      ? agent.operationalPrompt.trim()
      : buildDefaultOperationalPrompt(agent);

  // Build memory context
  const memoryContext = memories.length > 0
    ? `\n[RELEVANT MEMORIES]\n${memories.map((m, i) => `${i + 1}. ${m}`).join("\n")}\n`
    : "";

  // Build task context
  const taskContext = taskDescription
    ? `\n[CURRENT TASK]\n${taskDescription}\n`
    : "";

  // Get channel overlay
  const channelOverlay = CHANNEL_OVERLAYS[channel];

  // Assemble final prompt
  return `
[AGENT IDENTITY]
${identityText}

[OPERATIONAL DIRECTIVES]
${operationalText}

[ROLE CONTEXT]
Rank: ${agent.rank}
Role: ${agent.role}${memoryContext}${taskContext}${channelOverlay}
`.trim();
}

/**
 * Extract identity from legacy systemPrompt (heuristic: first paragraph before directives)
 */
function extractIdentityFromLegacyPrompt(legacyPrompt: string, agent: PromptAssemblyInput["agent"]): string {
  // Try to find the first paragraph that describes "who am I"
  const lines = legacyPrompt.split("\n").filter(l => l.trim());
  const identityLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Stop at directive markers
    if (
      trimmed.startsWith("Your directives:") ||
      trimmed.startsWith("When the Commander") ||
      trimmed.startsWith("Never ") ||
      trimmed.startsWith("Always ") ||
      trimmed.match(/^\d+\./)
    ) {
      break;
    }
    if (trimmed) identityLines.push(trimmed);
  }

  return identityLines.length > 0
    ? identityLines.join(" ")
    : `You are ${agent.name}, a ${agent.rank.toLowerCase()} specializing in ${agent.role.toLowerCase()}.`;
}

/**
 * Build default operational prompt from agent role/rank
 */
function buildDefaultOperationalPrompt(agent: PromptAssemblyInput["agent"]): string {
  const rankDirectives: Record<string, string> = {
    GENERAL: "Think in campaigns, not tasks. Prioritize ruthlessly. Identify the critical path. Accept acceptable losses. Communicate with clarity and authority.",
    CAPTAIN: "Track every resource. Identify bottlenecks. Optimize the supply chain. Map dependencies. Maintain the battle rhythm.",
    SPECIALIST: "Write code that ships. Debug like a sniper. Architecture serves the mission. Technical debt is an IED. Tools are force multipliers.",
    LIEUTENANT: "Map the terrain. Synthesize signal from noise. Document everything. Accuracy over speed.",
    SERGEANT: "The daily standup is sacred. Streaks are armor. Friction is the enemy. After-action reviews. No excuses.",
  };

  return rankDirectives[agent.rank] || "Execute your role with professional excellence.";
}

/**
 * Create a prompt assembly input from an agent record and channel.
 * Convenience function for call sites.
 */
export function createPromptAssemblyInput(agent: {
  name: string;
  rank: string;
  role: string;
  identity?: string | null;
  operationalPrompt?: string | null;
  systemPrompt: string;
}, channel: Channel, options?: {
  taskDescription?: string;
  memories?: string[];
  overrides?: PromptAssemblyInput["overrides"];
}): PromptAssemblyInput {
  return {
    agent,
    channel,
    taskDescription: options?.taskDescription,
    memories: options?.memories,
    overrides: options?.overrides,
  };
}