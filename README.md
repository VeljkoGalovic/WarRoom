# WarRoom

A Next.js 16 (App Router, Turbopack) productivity app that gamifies personal goals as a sci-fi military campaign.

Stack: Postgres + Prisma + Redis + NextAuth, styled with Tailwind and shadcn/ui.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Agent Architecture

WarRoom includes a multi-agent system with the following components:

### 1. Agent Service (Internal)
The app talks to a single internal Agent Service via the `/api/agents/chat` endpoint. Agents are defined in the database with:
- **Identity fields**: `name`, `rank` (GENERAL/CAPTAIN/SPECIALIST/LIEUTENANT/SERGEANT), `role`
- **Persona**: `identity` (stable "who am I"), `operationalPrompt` (default task framing), `systemPrompt` (legacy)
- **Model routing**: `modelEndpoint` points to OmniRoute

### 2. OmniRoute (LLM Gateway)
All LLM calls route through OmniRoute running locally on port 20128.

**Environment variables:**
```bash
OMNIROUTE_BASE_URL=http://localhost:20128/home
OMNIROUTE_API_KEY=your-api-key  # optional
```

**Models configured:**
- Chat: `gpt-4o-mini` (or your preferred model)
- Embeddings: `text-embedding-3-small`

### 3. Prompt Assembly & Channel Overlays
System prompts are assembled from components:
- Agent identity (`identity` field)
- Operational directives (`operationalPrompt`)
- Relevant memories (semantic search)
- Channel overlay (internal/telegram/external)

**Channels:**
| Channel | Persona Voice | Use Case |
|---------|---------------|----------|
| `internal` | Full | WarRoom UI chat |
| `telegram` | Stripped | Telegram relay |
| `external` | Fully neutral | Emails, documents, briefings |

### 4. Memory System (pgvector)
Semantic memory using PostgreSQL + pgvector:

- **Memory model**: `content` (text) + `embedding` (vector(1536))
- **Search**: Cosine similarity via HNSW index
- **Extraction**: Heuristic extraction from conversations (facts, preferences, decisions)
- **Injection**: Top-5 relevant memories injected into prompt at request time

**Enable pgvector:**
```bash
# In PostgreSQL container:
apk add postgresql16-dev build-base git
cd /tmp && git clone --branch v0.8.1 --depth 1 https://github.com/pgvector/pgvector.git
cd pgvector && make && make install
# Then in psql:
CREATE EXTENSION vector;
CREATE INDEX memory_embedding_hnsw_idx ON "Memory" USING hnsw (embedding vector_cosine_ops);
```

### 5. De-personalization Pipeline
External-facing output passes through a two-pass neutralization:
1. **LLM pass**: Rewrite via OmniRoute with strict neutralization prompt
2. **Verification pass**: Token-based check for remaining persona tokens (ranks, agent names, military jargon)
3. **Retry once** if tokens found, then **hard filter** as fallback

### 6. Telegram Adapter (Optional)
Relay messages between Telegram and WarRoom agents.

**Setup:**
1. Create bot via @BotFather
2. Set webhook to your adapter endpoint
3. Configure shared secret for authentication

**Run locally:**
```bash
TELEGRAM_BOT_TOKEN=xxx TELEGRAM_WEBHOOK_SECRET=xxx node telegram-adapter.js
```

**systemd unit** (for Ubuntu server):
```ini
[Unit]
Description=WarRoom Telegram Adapter
After=network.target

[Service]
Type=simple
User=warroom
WorkingDirectory=/opt/warroom
ExecStart=/usr/bin/node telegram-adapter.js
Restart=on-failure
RestartSec=5
Environment=TELEGRAM_BOT_TOKEN=xxx
Environment=TELEGRAM_WEBHOOK_SECRET=xxx

[Install]
WantedBy=multi-user.target
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | NextAuth.js secret |
| `NEXTAUTH_URL` | Yes | App URL (e.g., `http://localhost:3000`) |
| `REDIS_URL` | Yes | Redis connection string |
| `OMNIROUTE_BASE_URL` | Yes | OmniRoute base URL (default: `http://localhost:20128/home`) |
| `OMNIROUTE_API_KEY` | No | OmniRoute API key |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token |
| `TELEGRAM_WEBHOOK_SECRET` | No | Webhook verification secret |

---

## Development Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database commands
npx prisma db push        # Push schema changes
npx prisma studio         # Open Prisma Studio
npx prisma generate       # Regenerate Prisma Client

# Linting
npm run lint
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agents/
│   │   │   ├── chat/           # Main chat endpoint
│   │   │   ├── test-depersonalize/  # De-personalization test
│   │   │   └── [id]/           # Agent CRUD
│   │   ├── goals/              # Goals API
│   │   └── milestones/         # Milestones API
│   ├── dashboard/
│   │   ├── team/               # Agent chat UI
│   │   ├── warmap/             # Campaign map
│   │   └── goals/              # Goals management
│   └── ...
├── lib/
│   ├── providers.ts            # LLM provider resolution
│   ├── prompt-assembly.ts      # System prompt assembly
│   ├── memory.ts               # Memory CRUD + search
│   ├── embeddings.ts           # Embedding generation
│   ├── depersonalize.ts        # Output neutralization
│   └── prisma.ts               # Prisma client
├── components/
│   └── hud/                    # Tactical UI components
└── ...
```

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OmniRoute](https://github.com/omniroute/omniroute)