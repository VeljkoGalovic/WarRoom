# War Room: Master Blueprint & Implementation Plan

## 1. Executive Vision: What War Room Actually Is

War Room is a personal tactical command and orchestration platform designed for a solo maker, competitive programmer, and student. It replaces mundane productivity apps with a high-immersion, military-sci-fi tactical HUD interface.

It consists of four core pillars:
- [ ] **The Command Overview (`/dashboard`)**: A high-level intelligence briefing of active campaigns, daily momentum, system health, and quick-dispatch triggers.
- [ ] **Tactical Goals & Daily Operations (`/dashboard/goals`)**: A deep-dive tracking engine for broad, multi-month objectives (e.g., winning a math competition or mastering systems programming). It splits goals into detailed execution strategies, blocker logs, and daily micro-milestones (e.g., studying trigonometry or writing 50 lines of SystemVerilog).
- [ ] **AI Command Staff (`/dashboard/team`)**: A roster of specialized AI agents acting as your virtual staff. Powered by OmniRoute and free NVIDIA models (like `nvidia/nvidia-nim/...`), each agent has a specific military rank, role, and system prompt (e.g., a General for macro planning, a Spec Ops Coder for rapid code generation, or a Logistics Captain). You can chat with them or dispatch operational tasks directly from the dashboard.
- [ ] **War Map Campaign Visualizer (`/dashboard/warmap`)**: A graphical, node-based or sector-grid visualizer representing your ongoing "campaigns" and conquered objectives, styled with tactical maps, badges, and atmospheric UI elements instead of plain black-and-white boxes.

## 2. Detailed Step-by-Step Implementation Plan

- [ ] **Phase 1: Tactical HUD Design System & Theme Overhaul**
  - **Objective:** Erase generic SaaS aesthetics and establish an immersive, high-contrast dark-mode military-sci-fi HUD.
  - [ ] **1.1 Color Palette & Typography:** Configure Tailwind with obsidian slate backgrounds (`#030712`, `#090d16`), glowing amber (`#f59e0b`) and phosphor-green (`#10b981`) accent borders, monospaced tactical timestamps (`font-mono`), and uppercase letter-spacing for headers.
  - [ ] **1.2 HUD Component Primitives:** Build custom reusable UI primitives (`src/components/hud/`):
    - [ ] **TacticalCard:** Framed panels with corner reticle markers, glowing top borders, and subtle backdrop blur.
    - [ ] **StatusBadge:** Military-style classification badges (e.g., DEFCON 1, ACTIVE, MISSION COMPLETE).
    - [ ] **TerminalInput / TacticalButton:** High-feedback interactive elements with hover phosphor glows and click sounds/animations.

- [ ] **Phase 2: Lightweight Local Data & Schema Architecture**
  - **Objective:** Purge all multi-tenant SaaS models (Stripe, workspaces, complex auth) and establish a lean, single-user schema.
  - [ ] **2.1 Simplified Prisma Schema:** Update `prisma/schema.prisma` to retain only essential entities:
    - [ ] **Goal:** `id`, `title`, `description`, `strategy`, `status` (ACTIVE, COMPLETED, ARCHIVED), `threatLevel`, `createdAt`, `updatedAt`.
    - [ ] **Milestone:** `id`, `goalId`, `title`, `isCompleted`, `date`, `notes`.
    - [ ] **Agent:** `id`, `name`, `rank` (e.g., General, Captain, Specialist), `role`, `systemPrompt`, `modelEndpoint`, `avatarIcon`.
    - [ ] **ActivityLog:** `id`, `timestamp`, `category`, `message`.
  - [ ] **2.2 Tactical Seed Engine:** Populate `prisma/seed.ts` with your actual macro goals (e.g., math competition prep, software projects), sample daily study milestones, and default AI command staff agents.

- [ ] **Phase 3: Tactical Goals & Daily Micro-Milestones Engine (`/dashboard/goals`)**
  - **Objective:** Build a frictionless interface for managing broad objectives and chewing through daily study/coding micro-tasks.
  - [ ] **3.1 Macro Goal View:** Display goals grouped by priority or category. Each goal card expands to show:
    - [ ] Detailed objective description.
    - [ ] Strategic execution plan ("How I am going to achieve it").
    - [ ] Blocker log / friction notes.
  - [ ] **3.2 Daily Micro-Milestone Tracker:**
    - [ ] An inline checklist of daily micro-tasks (e.g., "Complete 5 trigonometry integration problems", "Refactor Prisma adapter").
    - [ ] Quick-add input bar for adding new daily micro-tasks instantly with a single keystroke.
    - [ ] Momentum streak counter and completion progress bars.

- [ ] **Phase 4: AI Command Staff & OmniRoute Integration (`/dashboard/team`)**
  - **Objective:** Implement the AI agent roster backed by OmniRoute and NVIDIA NIM models.
  - [ ] **4.1 OmniRoute Service Utility:** Create `src/lib/omniroute.ts` configured with an OpenAI-compatible SDK pointing to your OmniRoute endpoint and API token, defaulting to free NVIDIA models.
  - [ ] **4.2 Agent Roster Dashboard (`/dashboard/team`):**
    - [ ] Visual grid of your AI command staff showing their name, military rank insignia, role description, and assigned model string.
    - [ ] Custom modal or inline drawer to edit agent system prompts on the fly.
  - [ ] **4.3 Direct Tactical Dispatch / Chat Interface:**
    - [ ] A dedicated command console where you can select an agent (e.g., dispatching a coding task to the Spec Ops Coder or planning advice to the General) and receive real-time streamed responses via Server-Sent Events (SSE).

- [ ] **Phase 5: War Map Campaign Visualizer (`/dashboard/warmap`)**
  - **Objective:** Transform goal progress into an engaging graphical campaign map.
  - [ ] **5.1 Graphical Map Layout:** Build an interactive node-based or sector-grid view (`/dashboard/warmap`) using SVG/Canvas or styled flex layouts.
  - [ ] **5.2 Visual Nodes & Sprites:**
    - [ ] Map active goals and campaigns as interconnected nodes/strongholds on a tactical grid.
    - [ ] Color-code nodes by completion status (e.g., glowing green for conquered sectors, amber for contested fronts, red for blocked objectives).
    - [ ] Add tooltips showing milestone counts, completion percentages, and assigned AI agents supporting that front.

- [ ] **Phase 6: System Integration & Polish**
  - **Objective:** Run end-to-end testing, verify all navigation flows, and ensure lightning-fast client-side performance.
  - [ ] **6.1 Command Center Navigation:** Wire up the sidebar with quick jump-links to Overview, Goals, Command Staff, and War Map.
  - [ ] **6.2 Keyboard Shortcuts (`Cmd+K`):** Implement a quick-command palette to instantly create a new milestone, ping an AI agent, or jump between campaigns.
  - [ ] **6.3 Final Build Verification:** Run TypeScript compilation check (`npx tsc --noEmit`) and Next.js production build (`npm run build`) to guarantee absolute stability.