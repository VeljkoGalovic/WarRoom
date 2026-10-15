# 3D War Map Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2D warmap at `/dashboard/warmap` with the 3D tactical map backed by live database data, delivered in three phases: Phase 1 = live map, Phase 2 = detail panel + ops log, Phase 3 = drag & persist.

**Architecture:** Approach A — purpose-built `GET /api/warmap` endpoint returns a normalized payload (goals with computed state/progress/positions, agents as satellites, derived connections). Frontend polls this endpoint every 45s, normalizes into a single zustand store (`useWarMapStore`) that becomes the source of truth for the canvas and all HUD panels. Prisma schema gets nullable `mapX/mapY/mapZ` on Goal and Agent; stored positions win, computed fallback otherwise. Old 2D map and preview trees deleted.

**Tech Stack:** Next.js 16 App Router, Prisma 7.10 + PostgreSQL 16 (port 5433), @react-three/fiber 9.8.1, @react-three/drei 10.7.9, @react-three/postprocessing 3.1.3, Zustand for client state, Tailwind + HUD component kit (`src/components/hud/`).

**Spec:** `docs/superpowers/specs/2026-10-15-warmap-3d-integration-design.md`

## Global Constraints

- Existing data-fetch pattern: plain `fetch()` in `useEffect` → state → render (no tRPC/SWR/react-query). Follow this exactly.
- Prisma only in API routes via `src/lib/prisma.ts` singleton; auth stub uses `prisma.user.findFirst()`.
- CSS Modules in preview vs Tailwind + HUD kit in main app — migrated components use the HUD kit.
- `next dev` re-adds the AGENTS.md block in CLAUDE.md — leave it in diffs.
- Git commits end with `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
- Dev server runs at `http://localhost:3001` (verify with curl 200 after changes).
- Float32 GPU precision: positions up to ±2000 are safe; no `infiniteGrid` mode (use `followCamera`).
- Poll/drag race handled by queue-until-drag-end in the controller.

## Review Focus

| Input / Condition | Expected Behavior | Pinned in Task |
|---|---|---|
| Empty DB (no goals/agents) | Map renders grid/HUD with zeros, no fake data, no crash | Task 1.2, 2.1 |
| Goal status=COMPLETED | NodeState="conquered", green color, progress=100 | Task 1.4 |
| Goal status=ACTIVE + threat=CRITICAL | NodeState="at-risk", red color | Task 1.4 |
| Goal status=ACTIVE + threat=MEDIUM | NodeState="active", amber color | Task 1.4 |
| Agent without stored position | Falls back to deterministic satellite orbit around its goal | Task 1.5 |
| Poll fires during drag | Incoming data queued, applied after drag ends — node never jumps | Task 3.2 |
| PATCH /api/warmap/positions fails | Position reverts on next poll; toast/log entry in ops panel | Task 3.3 |
| Visibility change (tab focus) | Immediate refetch, not just wait for interval | Task 1.2 |
| Connections derived correctly | Agent→goal tethers from `Goal.agentId`; goal↔goal nearest-2 by fallback | Task 1.4 |

---

### Task 1.1: Prisma Schema — Add Position Fields

**Files:**
- Modify: `prisma/schema.prisma:28-45` (Goal model), `prisma/schema.prisma:63-83` (Agent model)

**Interfaces:**
- Produces: `Goal.mapX`, `Goal.mapY`, `Goal.mapZ` (Float?); `Agent.mapX`, `Agent.mapY`, `Agent.mapZ` (Float?)

- [ ] **Step 1: Add position fields to Goal model**

```prisma
model Goal {
  id          String       @id @default(cuid())
  title       String
  description String?      @db.Text
  strategy    String?      @db.Text
  status      GoalStatus   @default(ACTIVE)
  threatLevel ThreatLevel  @default(LOW)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  milestones  Milestone[]
  agentId     String?
  agent       Agent?       @relation(fields: [agentId], references: [id], onDelete: SetNull)
  // --- NEW: map positions (nullable = use computed fallback) ---
  mapX Float?
  mapY Float?
  mapZ Float?

  @@index([userId])
  @@index([status])
}
```

- [ ] **Step 2: Add position fields to Agent model**

```prisma
model Agent {
  id                String   @id @default(cuid())
  name              String
  rank              String
  role              String   @db.Text
  identity          String?  @db.Text
  operationalPrompt String?  @db.Text
  systemPrompt      String   @db.Text
  modelEndpoint     String
  avatarIcon        String?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  goals             Goal[]
  memories          Memory[]
  activityLogs      ActivityLog[]
  // --- NEW: map positions (nullable = use computed fallback) ---
  mapX Float?
  mapY Float?
  mapZ Float?

  @@index([userId])
}
```

- [ ] **Step 3: Apply schema to dev DB**

```bash
cd /home/veljkogalovic/WarRoom && npx prisma db push
```

Expected: Success, new columns added to `Goal` and `Agent` tables.

- [ ] **Step 4: Verify schema change**

```bash
npx prisma db pull && grep -A3 "mapX\|mapY\|mapZ" prisma/schema.prisma
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add map position fields to Goal and Agent models

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 1.2: API Route — GET /api/warmap (Core Payload)

**Files:**
- Create: `src/app/api/warmap/route.ts`
- Test: `src/app/api/warmap/route.test.ts`

**Interfaces:**
- Consumes: `prisma.goal.findMany({ include: { milestones, agent } })`, `prisma.agent.findMany({ where: { isActive: true } })`
- Produces: `WarMapPayload` (goals, agents, connections, stats) per spec §4.1

- [ ] **Step 1: Write failing test**

```ts
// src/app/api/warmap/route.test.ts
import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    goal: { findMany: vi.fn() },
    agent: { findMany: vi.fn() },
  },
}));

describe("GET /api/warmap", () => {
  it("returns WarMapPayload with goals, agents, connections, stats", async () => {
    const mockGoals = [
      {
        id: "g1", title: "GOAL ONE", description: null, strategy: null,
        status: "ACTIVE", threatLevel: "CRITICAL", userId: "u1",
        milestones: [{ id: "m1", isCompleted: true }, { id: "m2", isCompleted: false }],
        agent: { id: "a1", name: "AGENT ONE", role: "TACTICAL", rank: "CAPTAIN",
                 identity: null, operationalPrompt: null, systemPrompt: "",
                 modelEndpoint: "", avatarIcon: null, isActive: true, userId: "u1",
                 mapX: null, mapY: null, mapZ: null },
        mapX: 100, mapY: 0, mapZ: -50,
      },
    ];
    const mockAgents = [
      { id: "a1", name: "AGENT ONE", role: "TACTICAL", rank: "CAPTAIN",
        identity: null, operationalPrompt: null, systemPrompt: "",
        modelEndpoint: "", avatarIcon: null, isActive: true, userId: "u1",
        mapX: 120, mapY: 5, mapZ: -45, goals: [] },
    ];
    prisma.goal.findMany.mockResolvedValue(mockGoals);
    prisma.agent.findMany.mockResolvedValue(mockAgents);

    const req = new NextRequest(new URL("/api/warmap"));
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.goals).toHaveLength(1);
    expect(json.goals[0].state).toBe("at-risk"); // ACTIVE + CRITICAL
    expect(json.goals[0].progress).toBe(50);      // 1/2 completed
    expect(json.goals[0].position).toEqual([100, 0, -50]);
    expect(json.agents).toHaveLength(1);
    expect(json.connections.some(c => c.from === "a1" && c.to === "g1")).toBe(true);
    expect(json.stats.totalGoals).toBe(1);
    expect(json.stats.activeAgents).toBe(1);
  });

  it("maps COMPLETED status to conquered state", async () => {
    prisma.goal.findMany.mockResolvedValue([{
      id: "g2", title: "DONE", description: null, strategy: null,
      status: "COMPLETED", threatLevel: "LOW", userId: "u1",
      milestones: [{ id: "m3", isCompleted: true }],
      agent: null, mapX: null, mapY: null, mapZ: null,
    }]);
    prisma.agent.findMany.mockResolvedValue([]);

    const res = await GET(new NextRequest(new URL("/api/warmap")));
    const json = await res.json();
    expect(json.goals[0].state).toBe("conquered");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/veljkogalovic/WarRoom && npx vitest run src/app/api/warmap/route.test.ts
```
Expected: FAIL (route doesn't exist yet)

- [ ] **Step 3: Write minimal route implementation**

```ts
// src/app/api/warmap/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GoalMapNode {
  id: string;
  name: string;
  state: "neutral" | "active" | "conquered" | "at-risk" | "command";
  progress: number;
  threatLevel: string;
  status: string;
  position: [number, number, number];
  agentId: string | null;
  milestoneCount: number;
  completedMilestones: number;
}

interface AgentMapNode {
  id: string;
  name: string;
  role: string;
  rank: string;
  avatarIcon: string;
  isActive: boolean;
  position: [number, number, number];
}

interface Connection {
  from: string;
  to: string;
  type: "goal-goal" | "agent-goal";
}

interface WarMapStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  criticalGoals: number;
  totalAgents: number;
  activeAgents: number;
  averageProgress: number;
  lastUpdated: string;
}

function mapNodeState(status: string, threatLevel: string): GoalMapNode["state"] {
  if (status === "COMPLETED") return "conquered";
  if (status === "ARCHIVED") return "neutral";
  if (status === "ACTIVE" && (threatLevel === "CRITICAL" || threatLevel === "HIGH")) return "at-risk";
  return "active";
}

function computeFallbackPosition(id: string, index: number, total: number, isAgent = false): [number, number, number] {
  // Deterministic hash from id for stable positions across polls
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  const angle = (hash % 1000) / 1000 * Math.PI * 2;
  const radius = isAgent ? 35 + (index % 3) * 8 : 80 + (index % 5) * 60;
  return [
    Math.round(Math.cos(angle) * radius),
    0,
    Math.round(Math.sin(angle) * radius),
  ];
}

function getPosition(entity: { mapX: number | null; mapY: number | null; mapZ: number | null }, fallback: [number, number, number]): [number, number, number] {
  if (entity.mapX !== null && entity.mapY !== null && entity.mapZ !== null) {
    return [entity.mapX, entity.mapY, entity.mapZ];
  }
  return fallback;
}

export async function GET() {
  try {
    const [goals, agents] = await Promise.all([
      prisma.goal.findMany({
        include: { milestones: { orderBy: { date: "asc" } }, agent: true },
        orderBy: [{ status: "asc" }, { threatLevel: "desc" }, { createdAt: "desc" }],
      }),
      prisma.agent.findMany({ where: { isActive: true } }),
    ]);

    const goalsWithAgents = goals.filter(g => g.agentId && agents.some(a => a.id === g.agentId));

    // Build goal nodes
    const goalNodes: GoalMapNode[] = goals.map((goal, idx) => {
      const completed = goal.milestones.filter(m => m.isCompleted).length;
      const total = goal.milestones.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const fallbackPos = computeFallbackPosition(goal.id, idx, goals.length);
      return {
        id: goal.id,
        name: goal.title,
        state: mapNodeState(goal.status, goal.threatLevel),
        progress,
        threatLevel: goal.threatLevel,
        status: goal.status,
        position: getPosition(goal, fallbackPos),
        agentId: goal.agentId,
        milestoneCount: total,
        completedMilestones: completed,
      };
    });

    // Build agent nodes (satellites)
    const agentNodes: AgentMapNode[] = agents.map((agent, idx) => {
      const assignedGoals = goals.filter(g => g.agentId === agent.id);
      const fallbackPos = computeFallbackPosition(agent.id, idx, agents.length, true);
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        rank: agent.rank,
        avatarIcon: agent.avatarIcon ?? "",
        isActive: agent.isActive,
        position: getPosition(agent, fallbackPos),
      };
    });

    // Connections
    const connections: Connection[] = [];
    // agent-goal tethers
    for (const goal of goals) {
      if (goal.agentId) {
        connections.push({ from: goal.agentId, to: goal.id, type: "agent-goal" });
      }
    }
    // goal-goal nearest-2 by fallback position
    const goalsWithFallback = goals.map((g, i) => ({ goal: g, fallback: computeFallbackPosition(g.id, i, goals.length) }));
    for (const { goal: g1, fallback: f1 } of goalsWithFallback) {
      const sorted = goalsWithFallback
        .filter(({ goal }) => goal.id !== g1.id)
        .sort((a, b) => {
          const d1 = (a.fallback[0] - f1[0]) ** 2 + (a.fallback[2] - f1[2]) ** 2;
          const d2 = (b.fallback[0] - f1[0]) ** 2 + (b.fallback[2] - f1[2]) ** 2;
          return d1 - d2;
        })
        .slice(0, 2);
      for (const { goal: g2 } of sorted) {
        connections.push({ from: g1.id, to: g2.id, type: "goal-goal" });
      }
    }

    // Stats
    const activeGoals = goals.filter(g => g.status === "ACTIVE").length;
    const completedGoals = goals.filter(g => g.status === "COMPLETED").length;
    const criticalGoals = goals.filter(g => g.status === "ACTIVE" && (g.threatLevel === "CRITICAL" || g.threatLevel === "HIGH")).length;
    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => {
          const c = g.milestones.filter(m => m.isCompleted).length;
          const t = g.milestones.length;
          return sum + (t > 0 ? c / t : 0);
        }, 0) / goals.length * 100)
      : 0;

    const stats: WarMapStats = {
      totalGoals: goals.length,
      activeGoals,
      completedGoals,
      criticalGoals,
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.isActive).length,
      averageProgress: avgProgress,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ goals: goalNodes, agents: agentNodes, connections, stats });
  } catch (error) {
    console.error("Failed to fetch warmap:", error);
    return NextResponse.json({ error: "Failed to fetch warmap" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/app/api/warmap/route.test.ts
```
Expected: PASS

- [ ] **Step 5: Manual curl verification**

```bash
curl -s http://localhost:3001/api/warmap | jq '.goals[0], .agents[0], .connections[0], .stats'
```
Expected: Valid JSON with all four top-level keys populated.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/warmap/route.ts src/app/api/warmap/route.test.ts
git commit -m "feat: add GET /api/warmap endpoint with normalized map payload

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 1.3: API Route — GET /api/activity-logs

**Files:**
- Create: `src/app/api/activity-logs/route.ts`
- Test: `src/app/api/activity-logs/route.test.ts`

**Interfaces:**
- Consumes: `prisma.activityLog.findMany({ orderBy: { timestamp: "desc" }, take: 50 })`
- Produces: `{ logs: ActivityLogEntry[] }` per spec §4.2

- [ ] **Step 1: Write failing test**

```ts
// src/app/api/activity-logs/route.test.ts
import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activityLog: { findMany: vi.fn() },
  },
}));

describe("GET /api/activity-logs", () => {
  it("returns latest 50 activity logs", async () => {
    const mockLogs = [
      { id: "l1", timestamp: new Date("2026-10-15T10:00:00Z"), category: "PHYSICAL", message: "Morning run", metadata: null, userId: "u1", agentId: null },
      { id: "l2", timestamp: new Date("2026-10-15T09:00:00Z"), category: "SYSTEMS", message: "Deploy done", metadata: { buildId: "b1" }, userId: "u1", agentId: "a1" },
    ];
    prisma.activityLog.findMany.mockResolvedValue(mockLogs);

    const res = await GET(new NextRequest(new URL("/api/activity-logs")));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.logs).toHaveLength(2);
    expect(json.logs[0].id).toBe("l1");
    expect(json.logs[0].category).toBe("PHYSICAL");
    expect(json.logs[1].metadata).toEqual({ buildId: "b1" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/app/api/activity-logs/route.test.ts
```
Expected: FAIL

- [ ] **Step 3: Write route implementation**

```ts
// src/app/api/activity-logs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        category: log.category,
        message: log.message,
        metadata: log.metadata,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/app/api/activity-logs/route.test.ts
```
Expected: PASS

- [ ] **Step 5: Manual curl verification**

```bash
curl -s http://localhost:3001/api/activity-logs | jq '.logs | length'
```
Expected: Number ≤ 50

- [ ] **Step 6: Commit**

```bash
git add src/app/api/activity-logs/route.ts src/app/api/activity-logs/route.test.ts
git commit -m "feat: add GET /api/activity-logs endpoint for ops log panel

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 1.4: API Route — PATCH /api/warmap/positions

**Files:**
- Create: `src/app/api/warmap/positions/route.ts`
- Test: `src/app/api/warmap/positions/route.test.ts`

**Interfaces:**
- Consumes: JSON body `{ id: string, type: "goal" | "agent", position: [number, number, number] }`
- Produces: `{ ok: true }` on success, 400/404/500 on error

- [ ] **Step 1: Write failing test**

```ts
// src/app/api/warmap/positions/route.test.ts
import { PATCH } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    goal: { findUnique: vi.fn(), update: vi.fn() },
    agent: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

describe("PATCH /api/warmap/positions", () => {
  it("updates goal position and returns ok", async () => {
    prisma.goal.findUnique.mockResolvedValue({ id: "g1" });
    prisma.goal.update.mockResolvedValue({ id: "g1", mapX: 100, mapY: 0, mapZ: -50 });

    const body = { id: "g1", type: "goal", position: [100, 0, -50] };
    const req = new NextRequest(new URL("/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(prisma.goal.update).toHaveBeenCalledWith({
      where: { id: "g1" },
      data: { mapX: 100, mapY: 0, mapZ: -50 },
    });
  });

  it("rejects invalid coordinates (out of bounds)", async () => {
    prisma.goal.findUnique.mockResolvedValue({ id: "g1" });

    const body = { id: "g1", type: "goal", position: [5000, 0, 0] };
    const req = new NextRequest(new URL("/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent id", async () => {
    prisma.goal.findUnique.mockResolvedValue(null);

    const body = { id: "ghost", type: "goal", position: [0, 0, 0] };
    const req = new NextRequest(new URL("/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/app/api/warmap/positions/route.test.ts
```
Expected: FAIL

- [ ] **Step 3: Write route implementation**

```ts
// src/app/api/warmap/positions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BOUNDS = { xy: 2000, y: 50 };

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, type, position } = body as { id: string; type: "goal" | "agent"; position: [number, number, number] };

    if (!id || !type || !Array.isArray(position) || position.length !== 3) {
      return NextResponse.json({ error: "Invalid body: id, type, position[3] required" }, { status: 400 });
    }

    const [x, y, z] = position;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      return NextResponse.json({ error: "Coordinates must be finite numbers" }, { status: 400 });
    }
    if (Math.abs(x) > BOUNDS.xy || Math.abs(z) > BOUNDS.xy || Math.abs(y) > BOUNDS.y) {
      return NextResponse.json({ error: `Coordinates out of bounds (|x|,|z|≤${BOUNDS.xy}, |y|≤${BOUNDS.y})` }, { status: 400 });
    }

    if (type === "goal") {
      const goal = await prisma.goal.findUnique({ where: { id } });
      if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      await prisma.goal.update({ where: { id }, data: { mapX: x, mapY: y, mapZ: z } });
    } else {
      const agent = await prisma.agent.findUnique({ where: { id } });
      if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      await prisma.agent.update({ where: { id }, data: { mapX: x, mapY: y, mapZ: z } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update position:", error);
    return NextResponse.json({ error: "Failed to update position" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/app/api/warmap/positions/route.test.ts
```
Expected: PASS

- [ ] **Step 5: Manual curl verification**

```bash
# First GET a goal id
GOAL_ID=$(curl -s http://localhost:3001/api/warmap | jq -r '.goals[0].id')
curl -X PATCH http://localhost:3001/api/warmap/positions -H "Content-Type: application/json" -d "{\"id\":\"$GOAL_ID\",\"type\":\"goal\",\"position\":[150,0,-80]}" | jq
```
Expected: `{ "ok": true }`; subsequent GET /api/warmap shows the updated position.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/warmap/positions/route.ts src/app/api/warmap/positions/route.test.ts
git commit -m "feat: add PATCH /api/warmap/positions for drag persistence

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 2.1: Move 3D Preview Files → /dashboard/warmap/ & Delete Old 2D Map

**Files:**
- Delete: `src/app/dashboard/warmap/WarMapClient.tsx`, `src/app/dashboard/warmap/WarMapClient.module.css` (if exists)
- Delete: `src/app/warmap-3d-preview/` (entire directory after migration)
- Delete: `src/app/warmap-preview/` (entire directory — superseded)
- Move: All preview components → `src/app/dashboard/warmap/` (preserve internal imports)

**Interfaces:**
- Produces: new file tree under `src/app/dashboard/warmap/` ready for data wiring

- [ ] **Step 1: Create target directory structure**

```bash
mkdir -p /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/components /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/styles
```

- [ ] **Step 2: Move core canvas files**

```bash
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/WarMap3DCanvas.tsx /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/WarMap3DCanvasInner.tsx /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
```

- [ ] **Step 3: Move HUD panel components**

```bash
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/TopHUD.tsx /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/TopHUD.module.css /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/StaffRosterPanel.tsx /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/StaffRosterPanel.module.css /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/DailyOpsLogPanel.tsx /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/DailyOpsLogPanel.module.css /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/BottomBar.tsx /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/BottomBar.module.css /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
```

- [ ] **Step 4: Move styles directory**

```bash
mv /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview/styles /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/
```

- [ ] **Step 5: Update imports in moved files (fix relative paths)**

```bash
# WarMap3DCanvas.tsx: fix dynamic import path
sed -i 's|from "./WarMap3DCanvasInner"|from "./WarMap3DCanvasInner"|' /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/WarMap3DCanvas.tsx
# WarMap3DCanvasInner.tsx: fix store import
sed -i 's|from "./WarMap3DCanvas"|from "./WarMap3DCanvas"|' /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/WarMap3DCanvasInner.tsx
# All panels: fix store import
for f in TopHUD StaffRosterPanel DailyOpsLogPanel BottomBar; do
  sed -i 's|from "./WarMap3DCanvas"|from "./WarMap3DCanvas"|' /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/${f}.tsx
done
```

- [ ] **Step 6: Create new page.tsx using DashboardLayout**

```tsx
// src/app/dashboard/warmap/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WarMapPage } from "./WarMapPage";

export default function WarMapPageWrapper() {
  return (
    <DashboardLayout>
      <WarMapPage />
    </DashboardLayout>
  );
}
```

- [ ] **Step 7: Create WarMapPage client component (thin wrapper, mirrors preview page.tsx)**

```tsx
// src/app/dashboard/warmap/WarMapPage.tsx
"use client";

import * as React from "react";
import { Rajdhani, JetBrains_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TopHUD } from "./TopHUD";
import { StaffRosterPanel } from "./StaffRosterPanel";
import { DailyOpsLogPanel } from "./DailyOpsLogPanel";
import { BottomBar } from "./BottomBar";
import "./styles/animations.css";

const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["600", "700"], variable: "--wm-font-display", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--wm-font-mono", display: "swap" });

const WarMap3DCanvas = dynamic(
  () => import("./WarMap3DCanvas").then((mod) => mod.WarMap3DCanvas),
  { ssr: false, loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--wm-font-mono)", color: "#4DD8E8", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
      INITIALIZING TACTICAL DISPLAY...
    </div>
  )},
);

export function WarMapPage() {
  return (
    <main style={{ width: "100%", height: "100dvh", position: "relative", background: "#030712", overflow: "hidden" }}>
      <WarMap3DCanvas />
      <TopHUD />
      <StaffRosterPanel />
      <DailyOpsLogPanel />
      <BottomBar />
    </main>
  );
}
```

- [ ] **Step 8: Delete old 2D map and preview trees**

```bash
rm -rf /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/WarMapClient.tsx
rm -rf /home/veljkogalovic/WarRoom/src/app/dashboard/warmap/WarMapClient.module.css 2>/dev/null; true
rm -rf /home/veljkogalovic/WarRoom/src/app/warmap-3d-preview
rm -rf /home/veljkogalovic/WarRoom/src/app/warmap-preview
```

- [ ] **Step 9: Verify build passes**

```bash
cd /home/veljkogalovic/WarRoom && npx tsc --noEmit 2>&1 | head -30
```
Expected: No errors related to moved files (type errors in components are expected until Task 2.2 wires real data).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: move 3D war map to /dashboard/warmap, delete 2D map and preview trees

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 2.2: WarMapDataController — Polling & Store Wiring

**Files:**
- Create: `src/app/dashboard/warmap/WarMapDataController.tsx`
- Modify: `src/app/dashboard/warmap/WarMap3DCanvas.tsx` (extend store, remove fake data)
- Modify: `src/app/dashboard/warmap/WarMap3DCanvasInner.tsx` (render from store, add AgentSatellite, fix imports)
- Modify: `src/app/dashboard/warmap/TopHUD.tsx` (read from store)
- Modify: `src/app/dashboard/warmap/StaffRosterPanel.tsx` (read from store)
- Modify: `src/app/dashboard/warmap/DailyOpsLogPanel.tsx` (read from /api/activity-logs + store)
- Modify: `src/app/dashboard/warmap/BottomBar.tsx` (read from store)

**Interfaces:**
- Consumes: `/api/warmap` (45s poll + visibilitychange), `/api/activity-logs` (same cadence)
- Produces: Extended `useWarMapStore` with `nodes`, `agents`, `connections`, `stats`, `lastUpdated`, `isLoaded`, `loadError`, `activityLogs`, plus setters

- [ ] **Step 1: Extend the zustand store in WarMap3DCanvas.tsx**

```ts
// Replace the entire store definition (lines ~85-110) with:
interface WarMapNode {
  id: string;
  name: string;
  state: NodeState;
  position: [number, number, number];
  progress: number;
  connections: string[];
  sectorId: string;
  // Extended fields from API
  threatLevel: string;
  status: string;
  agentId: string | null;
  milestoneCount: number;
  completedMilestones: number;
}

interface AgentMapNode {
  id: string;
  name: string;
  role: string;
  rank: string;
  avatarIcon: string;
  isActive: boolean;
  position: [number, number, number];
}

interface Connection {
  from: string;
  to: string;
  type: "goal-goal" | "agent-goal";
}

interface WarMapStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  criticalGoals: number;
  totalAgents: number;
  activeAgents: number;
  averageProgress: number;
  lastUpdated: string;
}

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  category: string;
  message: string;
  metadata: unknown | null;
}

interface WarMapState {
  // Existing
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  cameraTarget: THREE.Vector3;
  isAnimating: boolean;
  logEntries: LogEntry[];
  // New: real data
  nodes: WarMapNode[];
  agents: AgentMapNode[];
  connections: Connection[];
  stats: WarMapStats | null;
  activityLogs: ActivityLogEntry[];
  lastUpdated: string | null;
  isLoaded: boolean;
  loadError: string | null;
  // Drag queue
  pendingPollData: { nodes: WarMapNode[]; agents: AgentMapNode[]; connections: Connection[]; stats: WarMapStats } | null;
  isDragging: boolean;
  // Setters
  setSelectedNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setCameraTarget: (target: THREE.Vector3, animate?: boolean) => void;
  addLogEntry: (entry: LogEntry) => void;
  setData: (payload: { nodes: WarMapNode[]; agents: AgentMapNode[]; connections: Connection[]; stats: WarMapStats }) => void;
  setActivityLogs: (logs: ActivityLogEntry[]) => void;
  setDragging: (dragging: boolean) => void;
  applyPendingPoll: () => void;
}

export const useWarMapStore = create<WarMapState>((set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,
  cameraTarget: new THREE.Vector3(0, 0, 0),
  isAnimating: false,
  logEntries: INITIAL_LOG_ENTRIES,
  // New
  nodes: [],
  agents: [],
  connections: [],
  stats: null,
  activityLogs: [],
  lastUpdated: null,
  isLoaded: false,
  loadError: null,
  pendingPollData: null,
  isDragging: false,
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setCameraTarget: (target, animate = true) => set({ cameraTarget: target, isAnimating: animate }),
  addLogEntry: (entry) => set((state) => ({ logEntries: [entry, ...state.logEntries].slice(0, 50) })),
  setData: (payload) => set((state) => {
    if (state.isDragging) {
      return { pendingPollData: payload };
    }
    return { ...payload, lastUpdated: payload.stats.lastUpdated, isLoaded: true, loadError: null, pendingPollData: null };
  }),
  setActivityLogs: (logs) => set({ activityLogs: logs }),
  setDragging: (dragging) => set({ isDragging: dragging }),
  applyPendingPoll: () => set((state) => {
    if (state.pendingPollData) {
      return { ...state.pendingPollData, lastUpdated: state.pendingPollData.stats.lastUpdated, pendingPollData: null };
    }
    return state;
  }),
}));
```

- [ ] **Step 2: Create WarMapDataController component**

```tsx
// src/app/dashboard/warmap/WarMapDataController.tsx
"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

const POLL_INTERVAL = 45_000;

export function WarMapDataController() {
  const setData = useWarMapStore((s) => s.setData);
  const setActivityLogs = useWarMapStore((s) => s.setActivityLogs);
  const applyPendingPoll = useWarMapStore((s) => s.applyPendingPoll);
  const isLoaded = useWarMapStore((s) => s.isLoaded);

  React.useEffect(() => {
    let cancelled = false;
    let intervalId: NodeJS.Timeout;

    async function fetchWarmap() {
      try {
        const [warmapRes, logsRes] = await Promise.all([
          fetch("/api/warmap"),
          fetch("/api/activity-logs"),
        ]);

        if (!warmapRes.ok) throw new Error(`warmap ${warmapRes.status}`);
        if (!logsRes.ok) throw new Error(`logs ${logsRes.status}`);

        const warmap = await warmapRes.json();
        const logs = await logsRes.json();

        if (!cancelled) {
          // Transform API payload to store types
          const nodes: WarMapNode[] = warmap.goals.map((g: any) => ({
            id: g.id,
            name: g.name,
            state: g.state,
            position: g.position,
            progress: g.progress,
            connections: warmap.connections.filter((c: any) => c.from === g.id || c.to === g.id).map((c: any) => c.from === g.id ? c.to : c.from),
            sectorId: "sector-" + (g.position[0] > 0 ? "east" : "west"),
            threatLevel: g.threatLevel,
            status: g.status,
            agentId: g.agentId,
            milestoneCount: g.milestoneCount,
            completedMilestones: g.completedMilestones,
          }));

          const agents: AgentMapNode[] = warmap.agents.map((a: any) => ({
            id: a.id,
            name: a.name,
            role: a.role,
            rank: a.rank,
            avatarIcon: a.avatarIcon,
            isActive: a.isActive,
            position: a.position,
          }));

          setData({ nodes, agents, connections: warmap.connections, stats: warmap.stats });
          setActivityLogs(logs.logs);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Warmap poll failed:", err);
          useWarMapStore.getState().setData({ nodes: [], agents: [], connections: [], stats: {
            totalGoals: 0, activeGoals: 0, completedGoals: 0, criticalGoals: 0,
            totalAgents: 0, activeAgents: 0, averageProgress: 0, lastUpdated: new Date().toISOString(),
          }});
        }
      }
    }

    // Initial fetch
    fetchWarmap();

    // Interval poll
    intervalId = setInterval(fetchWarmap, POLL_INTERVAL);

    // Refetch on visibility change (tab focus)
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchWarmap();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [setData, setActivityLogs]);

  // Apply any pending poll data when drag ends
  React.useEffect(() => {
    if (!isLoaded) return;
    applyPendingPoll();
  }, [isLoaded, applyPendingPoll]);

  return null; // No UI — this is a data-only controller
}
```

- [ ] **Step 3: Wire WarMapDataController into WarMapPage.tsx**

```tsx
// In WarMapPage.tsx, add import and render WarMapDataController alongside canvas
import { WarMapDataController } from "./WarMapDataController";
// Inside WarMapPage return:
<WarMapDataController />
```

- [ ] **Step 4: Refactor WarMap3DCanvasInner.tsx to render from store**

Key changes:
- Remove `TACTICAL_NODES`, `CONTOUR_RINGS`, `FINE_CONTOUR_RINGS` constants (keep grid/contour meshes)
- Import `useWarMapStore` and read `nodes`, `agents`, `connections`
- Replace hardcoded `TACTICAL_NODES.map()` with `nodes.map()`
- Add `AgentSatellite` component (smaller node tethered to goal)
- Render `Hyperlane` from `connections` (filter by type)
- Fix the erroneous `primitive` import from drei (remove it)
- Unify COLORS with WarMap3DCanvas.tsx (import from there)

```tsx
// At top of WarMap3DCanvasInner.tsx:
import { COLORS } from "./WarMap3DCanvas";
// Remove: import { Html, Grid, primitive } from "@react-three/drei";
// Change to:
import { Html, Grid } from "@react-three/drei";

// In WarMap3DCanvasInner component:
const nodes = useWarMapStore(useShallow((s) => s.nodes));
const agents = useWarMapStore(useShallow((s) => s.agents));
const connections = useWarMapStore(useShallow((s) => s.connections));

// Replace hardcoded Hyperlanes with:
{connections
  .filter((c) => c.type === "goal-goal")
  .map((conn) => {
    const fromNode = nodes.find((n) => n.id === conn.from);
    const toNode = nodes.find((n) => n.id === conn.to);
    if (!fromNode || !toNode) return null;
    const color = fromNode.state === "at-risk" ? COLORS.threatRed : fromNode.state === "active" ? COLORS.progressAmber : COLORS.holoCyan;
    return <Hyperlane key={conn.from + "-" + conn.to} from={fromNode.position} to={toNode.position} color={color} isActive={true} />;
  })}

{connections
  .filter((c) => c.type === "agent-goal")
  .map((conn) => {
    const agent = agents.find((a) => a.id === conn.from);
    const goal = nodes.find((n) => n.id === conn.to);
    if (!agent || !goal) return null;
    return <AgentTether key={conn.from + "-" + conn.to} from={agent.position} to={goal.position} color={COLORS.holoCyan} />;
  })}

// Render goal nodes:
{nodes.map((node) => (
  <TacticalNode
    key={node.id}
    node={node}
    isSelected={selectedNodeId === node.id}
    isHovered={hoveredNodeId === node.id}
    onSelect={() => setSelectedNode(node.id)}
    onHover={(hovered) => setHoveredNode(hovered ? node.id : null)}
  />
))}

// Render agent satellites:
{agents.map((agent) => (
  <AgentSatellite
    key={agent.id}
    agent={agent}
    goal={nodes.find((n) => n.agentId === agent.id)}
    isSelected={selectedNodeId === agent.id}
    isHovered={hoveredNodeId === agent.id}
    onSelect={() => setSelectedNode(agent.id)}
    onHover={(hovered) => setHoveredNode(hovered ? agent.id : null)}
  />
))}
```

- [ ] **Step 5: Add AgentSatellite component (in WarMap3DCanvasInner.tsx)**

```tsx
// Smaller node, orbits its goal, clickable
const AgentSatellite = React.memo(function AgentSatellite({
  agent,
  goal,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  agent: AgentMapNode;
  goal: WarMapNode | undefined;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const timeRef = React.useRef(0);
  const groupRef = React.useRef<THREE.Group | null>(null);
  const { camera } = useThree();

  const color = agent.isActive ? COLORS.holoCyan : 0x444444;
  const isInteractive = isSelected || isHovered;

  // Orbit position relative to goal
  const [localPos, setLocalPos] = React.useState([0, 0, 0]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (goal) {
      const angle = timeRef.current * 0.4;
      const radius = 40;
      setLocalPos([
        Math.cos(angle) * radius,
        5 + Math.sin(timeRef.current * 0.7) * 3,
        Math.sin(angle) * radius,
      ]);
    }
  });

  return (
    <group
      position={goal ? goal.position : agent.position}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
      onClick={onSelect}
      style={{ cursor: isInteractive ? "pointer" : "default" }}
    >
      <group position={localPos}>
        {/* Small sphere */}
        <mesh
          geometry={new THREE.SphereGeometry(6, 32, 32)}
          material={new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: isInteractive ? 0.9 : 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })}
        />
        {/* Glow ring */}
        <mesh
          geometry={new THREE.RingGeometry(8, 10, 32)}
          material={new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        {/* Label */}
        <Html position={[0, -14, 0]} occlude={false} scaleFactor={0.5} transform sprite={false}>
          <div style={{ textAlign: "center", pointerEvents: "none", transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: `#${color.toString(16).padStart(6, '0')}` }}>{agent.name}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "9px", color: "#8B9CB3" }}>{agent.role}</div>
          </div>
        </Html>
      </group>
    </group>
  );
});
```

- [ ] **Step 6: Add AgentTether component (thin line from agent to goal)**

```tsx
const AgentTether = React.memo(function AgentTether({
  from,
  to,
  color,
}: { from: [number, number, number]; to: [number, number, number]; color: number }) {
  const timeRef = React.useRef(0);
  const lineRef = React.useRef<THREE.Line | null>(null);

  const geometry = React.useMemo(() => {
    const pts = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [from, to]);

  const material = React.useMemo(() => new THREE.LineBasicMaterial({
    color, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false,
  }), [color]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (lineRef.current) {
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = 0.15 + Math.sin(timeRef.current * 2) * 0.05;
    }
  });

  return <line ref={lineRef} geometry={geometry} material={material} raycast={() => {}} />;
});
```

- [ ] **Step 7: Refactor TopHUD.tsx to read from store**

Replace all `FAKE_NODES` logic with:
```tsx
const nodes = useWarMapStore(useShallow((s) => s.nodes));
const stats = useWarMapStore(useShallow((s) => s.stats));

const conqueredCount = nodes.filter(n => n.state === "conquered").length;
const activeCount = nodes.filter(n => n.state === "active").length;
const threatCount = nodes.filter(n => n.state === "at-risk").length;
const globalProgress = stats?.averageProgress ?? 0;
```

- [ ] **Step 8: Refactor StaffRosterPanel.tsx to read agents from store**

Replace `STAFF_ROSTER` constant with:
```tsx
const agents = useWarMapStore(useShallow((s) => s.agents));
// Map to StaffMember shape expected by existing UI
const staff = agents.map(a => ({
  id: a.id,
  role: a.role.toUpperCase(),
  name: a.name,
  subtitle: `AI ${a.rank.charAt(0) + a.rank.slice(1).toLowerCase()}`,
  status: a.isActive ? "ONLINE" : "STANDBY" as const,
  currentTask: a.isActive ? "Operational" : "Standing by",
  taskProgress: a.isActive ? 50 : 0,
  avatarInitial: a.name[0],
  roleColor: a.isActive ? "#4DD8E8" : "#666",
}));
```

- [ ] **Step 9: Refactor DailyOpsLogPanel.tsx to read activityLogs from store**

Replace `INITIAL_LOGS` merge with:
```tsx
const activityLogs = useWarMapStore(useShallow((s) => s.activityLogs));
const logEntries = useWarMapStore(useShallow((s) => s.logEntries));

const allLogs = React.useMemo(() => [
  ...activityLogs.map(l => ({
    id: l.id,
    time: new Date(l.timestamp).toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }),
    category: l.category,
    message: l.message,
    color: categoryConfig[l.category as keyof typeof categoryConfig]?.color ?? "#4DD8E8",
  })),
  ...logEntries,
].slice(0, 15), [activityLogs, logEntries]);
```

- [ ] **Step 10: Refactor BottomBar.tsx similarly**

Use `logEntries` from store (already does) — just ensure `INITIAL_LOG_ENTRIES` is removed from WarMap3DCanvas.tsx and only store data is used.

- [ ] **Step 11: Verify dev server works**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/dashboard/warmap
```
Expected: 200

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: wire live data into 3D war map (Phase 1 complete)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```