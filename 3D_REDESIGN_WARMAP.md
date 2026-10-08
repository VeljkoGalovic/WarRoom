# TASK: Complete the Tactical Command Center UI & 3D War Map Integration (/warmap-3d-preview)

You are tasked with finishing the implementation of the `/warmap-3d-preview` route in Next.js 16. We have the 3D React Three Fiber canvas and bottom ticker ready; now we need to build the surrounding sci-fi tactical HUD chrome, left staff roster panel, right operations/AAR logging panel, and top header bar.

## 1. Design & Aesthetic Specifications
- **Theme:** High-tech military sci-fi command center (think *Expanse* / *EVE Online* / tactical HUD).
- **Color Palette:** 
  - Void Background: `#050810`
  - Holo Cyan (Primary UI): `#4DD8E8`
  - Progress Amber (Active/Warning): `#FFB347`
  - Conquest Green (Completed): `#2ECC71`
  - Threat Red: `#FF5555`
- **Typography:** Monospaced font (`font-mono`) for all telemetry, logs, and coordinates.
- **Glassmorphism:** Use `background: rgba(5, 8, 16, 0.85)`, `backdrop-filter: blur(12px)`, and subtle cyan border glows (`border: 1px solid rgba(77, 216, 232, 0.25)`).

---

## 2. Component Architecture Required

Create or update the following modular components within the `/app/warmap-3d-preview` directory structure:

### A. Top Command HUD (`TopHUD.bar.tsx` or inline in layout)
- Position: Fixed top, spanning full width (`z-50`, height `56px`).
- Content:
  - **Left:** System Title (`TACTICAL COMMAND // SECTOR-01`) with a pulsing green live indicator dot.
  - **Center:** Global Progress Bar (% of nodes conquered) and live sector status counters (`ACTIVE: 3 | SECURED: 12 | THREATS: 1`).
  - **Right:** Local timestamp, system health readout (`99.8% STABLE`), and quick-toggle button for audio/scanlines.

### B. Left Panel — Staff Roster (`StaffRosterPanel.tsx`)
- Position: Fixed left, vertically centered (`z-40`, width `320px`, top `64px`, bottom `48px`).
- Content:
  - Header: `AI PERSONNEL // COMMAND ROSTER`
  - List of tactical personnel/AI agents styled as military staff (e.g., *Kael - Logistics & Infrastructure*, *Zara - Strategic Analysis*, *Rex - Tactical Training & Physical Readiness*).
  - Each card must display: Avatar placeholder / icon, operational role, status badge (`ONLINE`, `DEEP FOCUS`, `STANDBY`), and current task assignment progress bar.
  - Interactive: Clicking a staff member filters or highlights related nodes on the 3D map.

### C. Right Panel — Operations Briefing & Interactive AAR (`OperationsAARPanel.tsx`)
- Position: Fixed right, vertically centered (`z-40`, width `360px`, top `64px`, bottom `48px`).
- Content:
  - **Upper Section:** Mission briefing overview, active directives, and sector intelligence summary.
  - **Lower Section:** Interactive **After-Action Report (AAR)** logger. 
    - Include a textarea with placeholder (`"Enter daily operational log & milestone notes..."`).
    - A category selector dropdown (`[Physical Training]`, `[Codeforces/Algorithmic]`, `[SaaS Architecture]`, `[System Engineering]`).
    - A submit button (`[TRANSMIT LOG]`) that appends the entry to the live bottom ticker and updates local simulation state.

### D. Central Wrapper & Zustand Store Integration (`page.tsx`)
- Combine the existing `WarMap3DCanvas` (Layer 0, pointer events enabled on canvas, pointer-events-none on wrappers where appropriate) with `TopHUD`, `StaffRosterPanel`, `OperationsAARPanel`, and `BottomBar`.
- Ensure Zustand store (`useWarMapStore`) properly syncs:
  - Selected node details populating the side panels when clicked.
  - Camera transitions when selecting nodes.
  - AAR submissions broadcasting new events to the `FAKE_LOG_ENTRIES` array.

---

## 3. Technical & Code Quality Rules
- **TypeScript:** Strictly typed with no `any` types for props or state models.
- **Performance:** Use `useMemo` and `useCallback` where necessary to avoid re-renders during canvas animation loops.
- **SSR Safety:** Ensure all window/canvas elements respect Next.js SSR boundaries.
- **No Comments / Clean Code:** Write self-documenting code without redundant inline comments. Use arrays over vectors where applicable.

Deliver the complete, production-ready code files for the layout and UI panels to bring the 3D War Map preview to full operational status.
