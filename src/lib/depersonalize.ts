/**
 * De-personalization Module
 *
 * Strips persona voice from agent output for external-facing artifacts.
 * Uses a two-pass approach: LLM neutralization + token-based verification.
 */

import { resolveAgentProviderConfig, buildApiUrl, getProviderHeaders, AgentProviderConfig } from "./providers";

// Persona tokens that should not appear in external output
const PERSONA_TOKENS = [
  // Rank titles
  "GENERAL", "CAPTAIN", "SPECIALIST", "LIEUTENANT", "SERGEANT",
  "General", "Captain", "Specialist", "Lieutenant", "Sergeant",
  // Agent names
  "VANCE", "KELSO", "NOVA", "MERCURY", "HAMMER",
  "Vance", "Kelso", "Nova", "Mercury", "Hammer",
  // Military jargon
  "COMMANDER", "Commander", "WAR ROOM", "War Room", "WarRoom",
  "TACTICAL", "Tactical", "OPERATIONAL", "Operational",
  "MISSION", "Mission", "DEPLOY", "Deploy", "ENGAGE", "Engage",
  "ROGER", "Roger", "AFFIRMATIVE", "Affirmative", "NEGATIVE", "Negative",
  "SITREP", "Sitrep", "INTEL", "Intel", "RECON", "Recon",
  "OBJECTIVE", "Objective", "TARGET", "Target", "HOSTILE", "Hostile",
  "ALL CLEAR", "All Clear", "STAND BY", "Stand By", "STAND DOWN", "Stand Down",
  // Persona catchphrases
  "THINK IN CAMPAIGNS", "TRACK EVERY RESOURCE", "WRITE CODE THAT SHIPS",
  "MAP THE TERRAIN", "DAILY STANDUP IS SACRED",
];

/**
 * Check if text contains persona tokens
 */
export function containsPersonaTokens(text: string): { found: boolean; tokens: string[] } {
  const foundTokens: string[] = [];
  const upperText = text.toUpperCase();

  for (const token of PERSONA_TOKENS) {
    if (upperText.includes(token.toUpperCase())) {
      foundTokens.push(token);
    }
  }

  return { found: foundTokens.length > 0, tokens: foundTokens };
}

/**
 * Neutralization prompt for LLM
 */
const NEUTRALIZATION_PROMPT = `
You are a professional communication specialist. Your task is to rewrite the given text to be completely neutral, professional, and business-appropriate.

RULES:
1. Remove ALL military ranks, titles, and jargon (General, Captain, Commander, War Room, tactical, mission, deploy, engage, roger, sitrep, etc.)
2. Remove ALL agent names and character references
3. Remove ALL in-character mannerisms and catchphrases
4. Preserve the factual content, analysis, and actionable advice
5. Use clear, structured, professional language
6. Output ONLY the rewritten text - no explanations, no meta-commentary

INPUT TEXT:
`;

/**
 * De-personalize text using LLM + verification
 */
export async function depersonalizeText(
  text: string,
  providerConfig: AgentProviderConfig,
  signal?: AbortSignal
): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // First pass: LLM neutralization
  let neutralized = await llmNeutralize(text, providerConfig, signal);

  // Verification pass: check for remaining persona tokens
  const check = containsPersonaTokens(neutralized);

  if (check.found) {
    console.warn(`[DEPERSONALIZE] Found persona tokens after first pass: ${check.tokens.join(", ")}. Retrying...`);

    // Second pass with stricter instruction
    neutralized = await llmNeutralize(
      `${text}\n\n[PREVIOUS ATTEMPT FAILED - REMAINING TOKENS: ${check.tokens.join(", ")}]\nRewrite more aggressively.`,
      providerConfig,
      signal
    );

    // Final check
    const finalCheck = containsPersonaTokens(neutralized);
    if (finalCheck.found) {
      console.error(`[DEPERSONALIZE] Still contains tokens after retry: ${finalCheck.tokens.join(", ")}. Applying hard filter.`);
      neutralized = hardFilter(neutralized);
    }
  }

  return neutralized;
}

/**
 * LLM-based neutralization
 */
async function llmNeutralize(
  text: string,
  providerConfig: AgentProviderConfig,
  signal?: AbortSignal
): Promise<string> {
  try {
    const response = await fetch(buildApiUrl(providerConfig, "/chat/completions"), {
      method: "POST",
      headers: getProviderHeaders(providerConfig),
      body: JSON.stringify({
        model: providerConfig.model,
        messages: [
          { role: "system", content: NEUTRALIZATION_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.1, // Low temperature for consistency
        max_tokens: 2048,
      }),
      signal,
    });

    if (!response.ok) {
      console.warn(`Neutralization API returned ${response.status}, using hard filter`);
      return hardFilter(text);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || hardFilter(text);
  } catch (error) {
    console.warn("Neutralization request failed, using hard filter:", error);
    return hardFilter(text);
  }
}

/**
 * Hard filter: simple token replacement as last resort
 */
export function hardFilter(text: string): string {
  let result = text;

  for (const token of PERSONA_TOKENS) {
    // Case-insensitive replacement
    const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, '[REDACTED]');
  }

  // Clean up multiple [REDACTED] in a row
  result = result.replace(/(\[REDACTED\][\s,]*)+/g, '[REDACTED] ');

  return result.trim();
}

/**
 * High-level function: de-personalize for a specific channel
 * "external" = full de-personalization
 * "telegram" = partial (preserves expertise, removes persona voice)
 * "internal" = no change
 */
export type OutputChannel = "internal" | "telegram" | "external";

export async function depersonalizeForChannel(
  text: string,
  channel: OutputChannel,
  providerConfig: AgentProviderConfig,
  signal?: AbortSignal
): Promise<string> {
  if (channel === "internal") {
    return text; // No change for internal channel
  }

  if (channel === "telegram") {
    // For telegram: lighter neutralization - keep expertise, strip voice
    return depersonalizeText(text, providerConfig, signal);
  }

  // external: full neutralization
  return depersonalizeText(text, providerConfig, signal);
}