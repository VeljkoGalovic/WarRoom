# 3D War Map Integration — Design Spec

**Date:** 2026-10-15
**Status:** Approved (Approach A: purpose-built `/api/warmap` endpoint)
**Scope:** Replace the 2D warmap at `/dashboard/warmap` with the 3D tactical map (currently at `/warmap-3d-preview`), backed by live database data.

---

## 1. Goals

- The 3D map at `/dashboard/warmap` renders **real** goals and agents, not fake data.
- Goal nodes are the primary map objects; **agents render as smaller satellite nodes** tethered to goals they work on.
- Node states, progress, and connections are derived from DB data server-side.
- The map polls for fresh data (no websockets needed).
- Clicking a node opens a detail panel with live DB data.
- Nodes can be dragged; positions persist to the DB.
- Entities without stored positions get deterministic computed fallback positions.

## 2. Non-Goals

- Auth/permissions (the app currently runs without auth; `userId` resolution follows existing patterns).
- Real-time push updates (polling only).
- Editing goals/agents from the map (detail panel is read-only).

## 3. Schema Changes ([prisma/schema.prisma](../../../prisma/schema.prisma))

Add nullable position fields to both map entity types:

```prisma
model Goal {
  // ...existing fields...
  mapX Float?
  mapY Float?
  mapZ Float?
}

model Agent {
  // ...existing fields...
  mapX Float?
  mapY Float?
  mapZ Float?
}
```

- `null` means "no stored position — use computed fallback".
- Additive change; applied via `prisma db push` (dev DB, no migration files needed).
- Optional `mapY` exists for future verticality; the UI keeps nodes on the plane (y locked) in Phase 3 drag.
- No new relations: `Goal.agentId` / `Agent.goals` already provide the goal↔agent link.

## 4. API Contract

### 4.1 `GET /api/warmap`

Single normalized payload for the whole map. Response:

```ts
interface WarMapPayload {
  goals: GoalMapNode[];
  agents: AgentMapNode[];
  connections: Connection[];
  stats: WarMapStats; // aggregate counts for TopHUD
}

interface GoalMapNode {
  id: string;
  name: string;              // = goal.title
  state: NodeState;          // derived, see 4.1.1
  progress: number;          // 0–100, milestone completion ratio
  threatLevel: string;       // raw CRITICAL/HIGH/MEDIUM/LOW
  status: string;            // raw ACTIVE/COMPLETED/ARCHIVED
  position: [number, number, number]; // DB coords or computed fallback
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
  position: [number, number, number]; // DB coords or computed fallback
}

interface Connection {
  from: string; // node id
  to: string;   // node id
  type: "goal-goal" | "agent-goal";
}

interface WarMapStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  criticalGoals: number;    // ACTIVE + CRITICAL threat
  totalAgents: number;
  activeAgents: number;
  averageProgress: number; // 0–100 across all goals
  lastUpdated: string;     // ISO timestamp
}
```

#### 4.1.1 Node State Mapping (server-side)

| Goal.status | threatLevel | → NodeState |
|---|---|---|
| COMPLETED | — | `conquered` |
| ARCHIVED | — | `neutral` |
| ACTIVE | CRITICAL or HIGH | `at-risk` |
| ACTIVE | MEDIUM or LOW | `active` |

#### 4.1.2 Positions — DB & Computed Fallback

- **Stored position wins.** If `mapX/mapY/mapZ` are set on the entity, they are used verbatim.
- **Fallback is deterministic.** Entities without stored positions get computed positions derived from a stable hash of their id, spread on a radial layout around origin (goals) or their parent goal (agent satellites). The same id always maps to the same fallback position, so nodes don't jump between polls.
- Goals with stored positions don't influence the fallback positions of goals without them (each entity falls back independently) — keeps the algorithm simple and stable.

#### 4.1.3 Connections

- `agent-goal`: from the real `Goal.agentId` relation (the "satellite tether").
- `goal-goal`: deterministic adjacency — nearest-N neighbors by fallback position (N=2), mirroring what the 2D map fabricated, so the map always shows a connected constellation rather than isolated nodes. Computed server-side, shipped as plain edges.

### 4.2 `GET /api/activity-logs`

Feeds the DailyOpsLogPanel. `ActivityLog` has no route today. Response:

```ts
interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO
  category: string;
  message: string;
  metadata: unknown | null;
}

// GET /api/activity-logs → { logs: ActivityLogEntry[] } (latest 50)
```

### 4.3 `PATCH /api/warmap/positions`

Persists a dragged node's position. Fired once per drag-end (one node per call).

```ts
// Request body:
{ id: string, type: "goal" | "agent", position: [number, number, number] }
// Response: { ok: true }
```

- Validates: id exists, type valid, coordinates finite numbers within sane bounds (|x|,|z| ≤ 2000, y locked to the goal-plane height in the UI; server clamps |y| ≤ 50).
- No optimistic-merge conflict handling — the map is single-user right now.

## 5. Frontend Structure

### 5.1 File Moves & Deletions

- **Delete:** `src/app/dashboard/warmap/WarMapClient.tsx` (2D map), its CSS module, and the whole `src/app/warmap-3d-preview/` tree once contents are migrated.
- **Move:** the 3D canvas family (`WarMap3DCanvas.tsx`, `WarMap3DCanvasInner.tsx`, HUD panels, styles) into `src/app/dashboard/warmap/`.
- `/dashboard/warmap/page.tsx` becomes a thin server page rendering the client `WarMapPage` (full-viewport 3D experience, same pattern as other dashboard pages).
- Sidebar link (`WAR MAP /dashboard/warmap`) unchanged.
- Dead components (OperationsAARPanel, SystemStatusBar, CampaignHeader) are deleted, not wired.

### 5.2 Data Flow

```
WarMapDataController (client, polls /api/warmap every 45s + on visibilitychange)
  └─ normalizes payload → useWarMapStore (single source of truth)
       ├─ WarMap3DCanvas → nodes/hyperlanes/labels render from store
       ├─ TopHUD ← stats
       ├─ StaffRosterPanel ← agents
       ├─ DailyOpsLogPanel ← /api/activity-logs (same poll cadence)
       └─ NodeDetailPanel (Phase 2) ← selected node data from store
```

- The zustand store is extended with `nodes`, `agents`, `connections`, `stats`, `lastUpdated`, `isLoaded`, `loadError` + setters; `FAKE_NODES`, `TACTICAL_NODES`, `INITIAL_LOG_ENTRIES` and all per-panel fake data are deleted.
- Positions applied by the controller: stored DB coords win, then cached positions from a local drag (so a drag isn't clobbered by the next poll — the local cache is cleared on page load and after each successful PATCH).

### 5.3 Canvas Refactor (`WarMap3DCanvasInner`)

- `TacticalNode` renders from store-driven props instead of a hardcoded array.
- New `AgentSatellite` component: smaller node type tethered to its goal, gentle idle orbit around the goal's position, clickable/hoverable like goal nodes.
- Node color/state fully data-driven from `NodeState`.
- Hyperlanes render from `connections` (goal-goal = thick lane, agent-goal = thin tether).
- Remove the erroneous `primitive` from the drei import; unify the divergent COLORS constants (single export from one module used by all files).

### 5.4 Interactions

- **Hover:** node highlight + label (existing behavior, now data-driven).
- **Click (Phase 2):** opens `NodeDetailPanel` — a HUD side panel built from `src/components/hud/` components (TacticalCard, StatusBadge, TacticalButton). Goal view: description, strategy, status/threat badges, milestone checklist, progress, assigned agent, recent activity. Agent view: identity, role, rank, status, assigned goals, recent activity.
- **Drag (Phase 3):** pointer-drag goals/agents on the map plane (y locked to plane), ghost/tether feedback during drag, PATCH on release, store updated locally for instant feedback, computed-fallback entities promoted to stored positions on first drag.

### 5.5 Polling & Refresh Behavior

- Poll every 45s (sets up + clears its own interval, also refetches on `visibilitychange` → visible).
- While dragging, incoming poll data is queued and applied when the drag ends (nodes must never jump mid-drag).
- Poll failures show a connection-lost state in the HUD (no crash, map keeps rendering last known data).

## 6. Phases

Each phase ends in a usable, verifiable state.

1. **Live map** — Schema fields + db push; `/api/warmap`; route takeover (delete 2D map + preview tree); data-driven goal nodes + agent satellites + hyperlanes; store becomes source of truth; polling; TopHUD + StaffRosterPanel wired.
2. **Detail panel + ops log** — `/api/activity-logs`; NodeDetailPanel with live data; DailyOpsLogPanel wired.
3. **Drag & persist** — drag interaction; `PATCH /api/warmap/positions`; fallback-override logic; poll-merge guard.

## 7. Error Handling

- API routes return JSON errors (`{ error: string }`) with proper status codes (400 validation, 404 not found, 500 server), matching existing route conventions.
- Client fetches are try/catch'd; failure keeps last-known data in the store and flags `loadError` for the HUD.
- Empty DB → empty map with grid/HUD showing zeros (no fake fallback data anywhere).
- Drag PATCH failure → position reverts to last-known on next poll; toast/log entry in ops panel.

## 8. Testing & Verification

- **API:** curl each endpoint against the running dev server + seeded DB; verify state mapping, progress ratios, connections, position persistence round-trip (PATCH → GET shows stored coords).
- **UI:** browser verification per phase — node states/colors match DB, polling picks up DB edits, panel data matches records, drag survives page reload.
- **Regression:** existing pages (`/dashboard/goals`, `/dashboard/team`) unaffected; no fake data references remain (`grep -r "FAKE_NODES\|TACTICAL_NODES\|INITIAL_LOG"` returns nothing).

## 9. Risks & Notes

- **Float32 on GPU**: positions up to ±2000 are fine (well below the ±2.4M precision cliff found in the grid-jiggle investigation); no infinite-grid mode used.
- **Poll/drag race:** handled by queue-until-drag-end (5.5).
- **Single-user assumptions:** no conflict handling on positions; revisit if multi-user arrives.
- `next dev` re-adds the AGENTS.md block — leave it in the diff when committing.
