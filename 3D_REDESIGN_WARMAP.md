# CRITICAL OVERHAUL: Tactical Command Center & 3D War Map Redesign (/warmap-3d-preview)

The current implementation of `/warmap-3d-preview` failed aesthetic and structural standards: the 3D scene is cluttered with ugly overlapping wireframe spheres and absurdly high hyperlane arches, and the UI chrome lacks proper spacing, scaling, and high-end sci-fi styling. 

You are required to completely refactor the 3D canvas architecture and UI layout to match a professional, cinematic tactical command center (inspired by *The Expanse* tactical displays and *EVE Online* strategic maps).

---

## 1. 3D Scene Architecture Overhaul (`WarMap3DCanvasInner.tsx`)

### A. Eliminate Ugly Wireframe Spheres
- **REMOVE** the giant overlapping `SectorShell` wireframe spheres entirely. They ruin visibility and look amateurish.
- **REPLACE THEM WITH:** A clean **Holographic Holotable Constellation**. 
  - Sector hubs should be laid out in a clean, equidistant radial pattern across the horizontal floor grid (`y = 0`).
  - Each sector hub is represented by a subtle, flat glowing concentric ring on the floor (`RingGeometry` or `LineLoop`) with a small pulsing beacon at its center.

### B. Fix Hyperlanes (Data Links)
- **REMOVE** high-arching vertical bezier curves.
- **REPLACE THEM WITH:** Low-profile, laser-thin straight lines or very gently curved horizontal arcs (`QuadraticBezierCurve3` with minimal height offset `y` variance) connecting nodes at ground/table level.
- Hyperlanes must glow softly with neon cyan (`#4DD8E8`), amber (`#FFB347`), or green (`#2ECC71`) depending on status, utilizing thin glowing tube geometries or line materials.

### C. Goal Nodes & Central Command Core
- Center Command Core should be a striking, compact geometric nexus at `[0, 0, 0]` (e.g., a glowing low-poly crystalline core or rotating nested rings), not a giant messy sphere.
- Goal nodes must be clean, floating geometric markers (small glowing spheres/cubes) hovering slightly above their sector hubs with crisp text sprite labels or HTML overlays.

---

## 2. UI Chrome & Layout Redesign (`page.tsx` & Panel Components)

### A. Layout Structure (Z-Index Layering)
- **Layer 0:** Full-screen R3F Canvas (`position: fixed`, `inset: 0`).
- **Layer 10:** Pointer-events-none container holding absolute-positioned UI panels, with `pointer-events: auto` explicitly enabled on all interactive buttons, cards, and inputs.

### B. Top Command HUD (`TopHUD.bar.tsx`)
- Height: `64px`, fixed top.
- Style: Solid dark backing (`rgba(5, 8, 16, 0.95)`), bottom border (`1px solid rgba(77, 216, 232, 0.3)`), subtle top glow.
- Content:
  - **Left:** System designation (`// SECTOR-01 COMMAND NEXUS`) with a glowing green pulse indicator.
  - **Center:** Global completion progress bar with percentage readout and live sector counters (`ACTIVE: 3 | SECURED: 12 | THREATS: 1`).
  - **Right:** Live UTC timestamp, system stability metric (`99.9%`), and telemetry status.

### C. Left Staff Roster Panel (`StaffRosterPanel.tsx`)
- Position: Fixed left (`top: 80px`, `bottom: 56px`, `left: 20px`, `width: 340px`).
- Style: Glassmorphic card (`background: rgba(8, 12, 22, 0.9)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(77, 216, 232, 0.25)`, `border-radius: 8px`, `padding: 16px`).
- Content:
  - Header: `AI PERSONNEL // TACTICAL ROSTER` with status count.
  - Cards for personnel (e.g., *Kael - Logistics*, *Zara - Strategy*, *Rex - Training*).
  - Each card must feature clear typography, role tags, active task meters, and interactive hover states that highlight corresponding nodes on the 3D map.

### D. Right Operations Briefing & AAR Panel (`OperationsAARPanel.tsx`)
- Position: Fixed right (`top: 80px`, `bottom: 56px`, `right: 20px`, `width: 380px`).
- Style: Matching glassmorphic container (`background: rgba(8, 12, 22, 0.9)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(77, 216, 232, 0.25)`, `border-radius: 8px`, `padding: 16px`).
- Content:
  - **Top Half:** Mission briefing, active sector telemetry, and selected node deep-dive details.
  - **Bottom Half:** Interactive **After-Action Report (AAR)** logger form.
    - Category dropdown selector (`[Physical Training]`, `[Algorithmic]`, `[SaaS Architecture]`, `[System Engineering]`).
    - Textarea for logging daily progress.
    - Submit button (`[TRANSMIT LOG]`) that pushes the entry directly into the live bottom ticker array and stores it in state.

### E. Bottom Ticker Bar (`BottomBar.tsx`)
- Height: `40px`, fixed bottom, full width.
- Clean scrolling or fading real-time log stream matching the tactical aesthetic.

---

## 3. Strict Code & Quality Requirements
- **No overlapping wireframe sphere meshes.** The 3D scene must look clean, minimal, and high-tech.
- **Zero layout clipping:** Ensure side panels do not overlap the canvas center or obscure critical 3D nodes.
- **Strict TypeScript:** No `any` types. Fully typed props and state interfaces.
- **Clean Code:** Write modular, production-ready code with no debugging logs or redundant comments.