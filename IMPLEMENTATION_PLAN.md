# WarRoom — Agent Capabilities Implementation Prompt

You are working on WarRoom, a Next.js 16 (App Router, Turbopack) productivity app that gamifies personal goals as a sci-fi military campaign. The stack is Postgres + Prisma + Redis + NextAuth, styled with Tailwind and shadcn/ui. A skeleton already exists, including an Agent model in Prisma, an agents API surface, and a chat route that currently calls a single hardcoded provider endpoint.

Your job is to implement the plan below, step by step. Do not skip steps. Do not refactor unrelated code.

## Non-negotiable rules before you touch anything

1. BEFORE making any change, inspect the current implementation. Read the Prisma schema, the agents API routes, the chat route, the environment file, and any existing components that render or call agents. Do not assume file names, folder structure, or existing field names. Discover them.
2. Produce a short written summary of what you found BEFORE writing any code. List the actual files you will modify, the actual Prisma models you will change, and any conflicts between what exists and what this prompt assumes. If something in this prompt contradicts reality, flag it and ask before proceeding.
3. Make changes incrementally. After each numbered step, stop, verify the app still builds and runs, and only then proceed. Do not batch all changes into one commit.
4. Never delete existing data or drop existing columns without a migration that preserves data. If a column must be renamed, add the new one, migrate data, then remove the old one in a separate step.
5. Do not introduce paid dependencies. Every external service must have a free tier or be self-hosted. Do not add a cloud vector database, a paid LLM proxy, or a managed memory service.
6. Keep the codebase coherent. If you find existing code that already does part of this plan, adapt it rather than duplicating it.

## High-level architecture you are building toward

The app talks to a single internal Agent Service. The Agent Service is the only place that assembles prompts, loads memory, and calls the LLM. Both the WarRoom UI and an external Telegram bot are thin adapters that call the same Agent Service. LLM calls go through a locally hosted OmniRoute instance which aggregates free provider tiers (NVIDIA NIM, OpenRouter, etc.) behind one OpenAI-compatible endpoint. Memory is stored in the existing Postgres database using pgvector. Persona is split from operational prompt, with channel overlays that suppress persona voice on external outputs.

## Step 1 — Environment and provider configuration

Goal: every agent call goes through OmniRoute, and no provider endpoint is hardcoded in application code.

1. Inspect the current environment file and the existing chat route to find where the provider base URL and API key are currently referenced.
2. Introduce environment variables for the OmniRoute base URL and API key. The base URL should default to a local address (OmniRoute typically runs on localhost on a specific port — discover the correct port by checking how OmniRoute is currently configured on this machine, or ask). The API key can be a placeholder if OmniRoute does not require one locally.
3. Remove any hardcoded provider domain from application code. There should be exactly one place in the codebase that knows the provider base URL, and it should read from environment.
4. Add a small provider configuration module that resolves a provider config object from an agent record. The module should support at minimum a default OmniRoute configuration and be structured so additional named providers can be added later without touching call sites.
5. Verify the app builds and the existing chat route still compiles. Do not yet change its behavior.

## Step 2 — Harden the chat route

Goal: the chat route never streams a broken response, always returns a clean error, and supports cancellation.

1. Read the current chat route in full.
2. Restructure it so the upstream fetch is fully resolved and validated before any streaming begins. If the upstream responds with a non-success status, return a structured JSON error to the client with an appropriate status code (502 for upstream failures, 404 for unknown agent, 400 for malformed input). Do not pipe an unvalidated upstream body to the client.
3. Add an AbortSignal to the upstream fetch and wire it to the incoming request so that if the client disconnects, the upstream call is cancelled.
4. Add a timeout to the upstream call. If the provider does not respond within a reasonable window, fail cleanly.
5. Log provider failures to the server console with enough context to debug (agent id, provider base URL, status, truncated body). Do not log API keys.
6. Do not change the response shape that the existing UI expects for successful calls. If you must change it, update the calling UI in the same step.
7. Verify by sending a message to an agent with OmniRoute running and with OmniRoute stopped. Both cases should produce clean, distinguishable outcomes.

## Step 3 — Split persona from operational prompt

Goal: each agent has a stable identity, a per-call operational prompt, and an explicit channel overlay mechanism.

1. Inspect the current Agent Prisma model. Identify the existing prompt field.
2. Add fields to the Agent model for: identity (the stable "who am I" text), operational prompt (default task framing), and any persona metadata you need (voice, boundaries). Keep the existing prompt field if it exists and backfill it into one of the new fields via a migration; do not lose existing values.
3. Design a prompt assembly function that takes an agent, a channel identifier (internal app, telegram, external communication), a task description, and relevant memories, and returns the final system prompt string. The assembly must apply channel overlays. For the external communication channel, the overlay must instruct the model to strip persona voice and output neutral, professional language. For internal channels, the overlay should preserve persona voice.
4. Update the chat route to use this assembly function instead of whatever prompt construction exists today.
5. Verify with two calls to the same agent: one tagged as internal and one tagged as external. The internal call should sound in-character; the external call should not.

## Step 4 — Persistent memory

Goal: agents remember past interactions and can retrieve relevant memories on each call.

1. Confirm whether the pgvector extension is available on the Postgres instance. If it is not installed, install it and enable it in the database. Document how it was enabled.
2. Add a Memory model to the Prisma schema with at minimum: id, agentId, userId, type (distinguish episodic from profile), content, embedding vector, metadata, createdAt. Add appropriate indexes.
3. Choose an embedding approach. It must be free and callable from the server. Prefer routing embeddings through the same OmniRoute instance if it exposes an embeddings endpoint; otherwise use a small local embedding model served from the Ubuntu server. Do not use a paid embedding API. Write the choice and the reasoning in a short comment or doc.
4. Implement a memory service with two functions: store a memory (compute embedding, insert row) and retrieve relevant memories (embed the query, do a vector similarity search scoped to the agent and user, return top-K).
5. Wire the memory service into the chat route. Before calling the LLM, retrieve relevant memories and inject them into the assembled system prompt. After a successful response, store the exchange as an episodic memory. Keep the storage step non-blocking where possible so it does not delay the user response.
6. Verify by having a conversation with an agent, restarting the server, and having another conversation where the agent references something from the first.

## Step 5 — Telegram adapter

Goal: the same agents are reachable from a Telegram group, using the same Agent Service, sharing the same memory.

1. Confirm with the user which Telegram bot token to use and which group (and topics, if a supergroup with topics) map to which agents. Do not invent a mapping.
2. Create a separate small service in the repository (its own folder, its own entry point) that runs independently of the Next.js process. It should be a thin adapter: receive a Telegram message, determine which agent and which user it maps to, call the Agent Service (the same internal endpoint the UI uses), and send the response back to the correct topic or chat.
3. Do not put any LLM logic, prompt assembly, or memory logic inside the Telegram adapter. It must only translate between Telegram and the Agent Service.
4. Authenticate the adapter to the Agent Service. The simplest acceptable approach for single-user personal use is a shared secret in an environment variable that the adapter sends and the service verifies. Do not expose the Agent Service publicly without this.
5. Provide a systemd unit file (or equivalent) so the adapter runs as a background service on the Ubuntu server, restarts on failure, and starts on boot. Write a short README section explaining how to install and start it.
6. Verify by messaging an agent from Telegram and confirming the same conversation context appears in the WarRoom UI.

## Step 6 — External output de-personalization

Goal: no external-facing artifact ever contains persona voice.

1. Identify every code path that produces an artifact intended for someone other than the user (emails, marketing copy, documents). If none exist yet, add a single reusable function now that future features will call, and document it.
2. The function must take raw agent output and a target channel, and return a rewritten version with persona voice removed. Implement it as a second LLM call through OmniRoute with a strict neutralization prompt, plus a lightweight post-check that flags any remaining persona tokens (rank words, agent names, military jargon) and retries once if found.
3. Route all external-producing features through this function. Do not allow any feature to bypass it.
4. Verify with a deliberately persona-heavy draft and confirm the output is neutral.

## Step 7 — Documentation and cleanup

Goal: the implementation is legible to future-you.

1. Add a section to the project README describing the agent architecture: Agent Service, OmniRoute, memory, Telegram adapter, channel overlays.
2. Document every new environment variable.
3. Document how to run OmniRoute locally, how to run the Telegram adapter, and how to enable pgvector.
4. Remove any dead code, unused imports, or orphaned endpoints that resulted from this work.
5. Do a final pass: search the codebase for any remaining hardcoded provider URLs, any place that constructs prompts outside the assembly function, and any place that would send raw agent output externally without going through the de-personalization function. Fix what you find.

## What to report back after each step

For every numbered step, report:
- What you inspected and what you found.
- What you changed, with a short rationale.
- What you verified and how.
- Anything you could not do, could not verify, or that contradicts this prompt.

If at any point reality disagrees with an assumption in this prompt, stop and ask. Do not guess. Do not silently work around a mismatch.
