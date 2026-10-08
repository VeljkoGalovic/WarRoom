/**
 * Provider Configuration Module
 *
 * Single source of truth for provider configuration.
 * Resolves provider config from agent records and environment.
 * Supports adding named providers later without touching call sites.
 */

export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  name: string;
}

export interface AgentProviderConfig extends ProviderConfig {
  model: string;
}

// Default OmniRoute configuration from environment
function getDefaultOmniRouteConfig(): ProviderConfig {
  return {
    baseUrl: process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/home",
    apiKey: process.env.OMNIROUTE_API_KEY || "",
    name: "omniroute",
  };
}

// Provider registry for named providers (extensible for future)
const providerRegistry = new Map<string, ProviderConfig>();

// Register default OmniRoute provider
providerRegistry.set("omniroute", getDefaultOmniRouteConfig());

/**
 * Get provider configuration by name.
 * Falls back to default OmniRoute if not found.
 */
export function getProviderConfig(name: string = "omniroute"): ProviderConfig {
  return providerRegistry.get(name) || getDefaultOmniRouteConfig();
}

/**
 * Register a named provider configuration.
 * Allows adding providers without modifying call sites.
 */
export function registerProvider(name: string, config: ProviderConfig): void {
  providerRegistry.set(name, config);
}

/**
 * Resolve provider configuration from an agent record.
 * Uses agent's modelEndpoint as the model identifier.
 * Provider name can be stored on agent in future; defaults to "omniroute".
 */
export function resolveAgentProviderConfig(agent: {
  modelEndpoint: string;
  providerName?: string;
}): AgentProviderConfig {
  const providerName = agent.providerName || "omniroute";
  const provider = getProviderConfig(providerName);

  return {
    ...provider,
    model: agent.modelEndpoint,
  };
}

/**
 * Build the full API URL for a given endpoint.
 */
export function buildApiUrl(provider: ProviderConfig, endpoint: string): string {
  const base = provider.baseUrl.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

/**
 * Standard headers for provider requests.
 */
export function getProviderHeaders(provider: ProviderConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  return headers;
}