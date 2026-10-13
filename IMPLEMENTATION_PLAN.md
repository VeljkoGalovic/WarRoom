# 3D Tactical Command Center - Implementation Plan
## Target: Match Proof of Concept Aesthetic While Maintaining Usability

---

## PHASE 1: LAYOUT & STRUCTURAL FOUNDATION

### 1.1 Page Layout Restructure (`page.tsx`)
- **Current**: 4-panel layout (TopHUD, Left Staff, Right AAR, Bottom Bar) over full-screen canvas
- **Target**: 3-panel layout matching proof of concept:
  - **Top Bar**: Campaign visualizer header with status badges (full width, ~60px)
  - **Main Grid**: 3-column layout:
    - Left: STAFF ROSTER (~300px, full height minus top/bottom bars)
    - Center: 3D TACTICAL DISPLAY (flexible, takes remaining space)
    - Right: DAILY OPERATIONS LOG (~380px, full height minus top/bottom bars)
  - **Bottom Bar**: System status ticker (~40px, full width)

### 1.2 CSS Grid Layout System
```css
.main-grid {
  display: grid;
  grid-template-rows: 60px 1fr 40px;
  grid-template-columns: 300px 1fr 380px;
  height: 100vh;
  width: 100vw;
}
```

---

## PHASE 2: TOP COMMAND BAR REDESIGN (`TopHUD.tsx` → `CampaignHeader.tsx`)

### 2.1 Visual Specification
- **Background**: `rgba(5, 8, 16, 0.95)` with `backdrop-filter: blur(12px)`
- **Border Bottom**: `1px solid rgba(77, 216, 232, 0.3)`
- **Title**: "CAMPAIGN VISUALIZER — 3D TACTICAL DISPLAY" (Rajdhani 700, 0.85rem, letter-spacing 0.1em)
- **Status Badges**: "ACTIVE" (green pulse), "SECURE" (cyan) - pill shaped with glow
- **Right Side**: UTC timestamp, system stability, connection status

### 2.2 Component Structure
```tsx
<CampaignHeader>
  <HeaderLeft>
    <StatusDot color="green" pulsing />
    <Title>CAMPAIGN VISUALIZER — 3D TACTICAL DISPLAY</Title>
  </HeaderLeft>
  <HeaderCenter>
    <StatusBadge variant="active">ACTIVE</StatusBadge>
    <StatusBadge variant="secure">SECURE</StatusBadge>
  </HeaderCenter>
  <HeaderRight>
    <UTCClock />
    <SystemHealth />
  </HeaderRight>
</CampaignHeader>
```

---

## PHASE 3: STAFF ROSTER PANEL REDESIGN (`StaffRosterPanel.tsx`)

### 3.1 Visual Specification (Matching Proof of Concept)
- **Panel Background**: `rgba(8, 12, 22, 0.9)` with `backdrop-filter: blur(16px)`, right border `1px solid rgba(77, 216, 232, 0.2)`
- **Header**: "STAFF ROSTER" with cyan accent dot
- **Staff Cards** (3 visible, matching proof):
  1. **LOGISTICS: KAEL** - AI Logistics - ONLINE (green)
  2. **STRATEGY: ZARA** - AI Tactical - DEEP FOCUS (amber)
  3. **TRAINING: REX** - AI Training - STANDBY (cyan)
- **Card Layout**:
  - Avatar: 40px circle with role color gradient, initial
  - Role Label: Small caps, role color (LOGISTICS/STRATEGY/TRAINING)
  - Name: Large, white (KAEL/ZARA/REX)
  - Status: Dot + label (ONLINE/DEEP FOCUS/STANDBY)
  - Current Task: Text with progress bar
  - Progress Bar: Thin, role-color gradient, animated flow

### 3.2 Data Updates
```tsx
const STAFF_ROSTER = [
  { id: "staff-1", role: "LOGISTICS", name: "KAEL", subtitle: "AI Logistics", status: "ONLINE", currentTask: "Supply chain optimization", taskProgress: 78, avatarInitial: "K", roleColor: "#2ECC71" },
  { id: "staff-2", role: "STRATEGY", name: "ZARA", subtitle: "AI Tactical", status: "DEEP FOCUS", currentTask: "Threat pattern recognition", taskProgress: 45, avatarInitial: "Z", roleColor: "#FFB347" },
  { id: "staff-3", role: "TRAINING", name: "REX", subtitle: "AI Training", status: "STANDBY", currentTask: "Combat readiness drills", taskProgress: 12, avatarInitial: "R", roleColor: "#4DD8E8" },
];
```

---

## PHASE 4: 3D TACTICAL DISPLAY REDESIGN (`WarMap3DCanvasInner.tsx`)

### 4.1 Core Visual Changes (Matching Proof of Concept)
**Three Primary Nodes as Large Glowing Spheres:**
1. **TACTICAL PHYSICAL** (Conquered - Green) - Position: Left-back
2. **DEPLOY WAR** (Active - Amber) - Position: Right-back
3. **REACH CODEFORCES** (At-Risk - Red) - Position: Front-center

**Node Design:**
- Large sphere (radius ~25-30) with emissive material
- Outer rotating ring showing progress (like Saturn)
- Inner pulsing core
- Label below with name and progress %
- State color: Green (conquered), Amber (active), Red (at-risk)

**Connections:**
- Curved bezier tubes between nodes (not flat lines)
- Animated particle flow along tubes
- Color matches source node state

**Environment:**
- Dark void background (`#050810`)
- Subtle floor grid
- Volumetric fog for depth
- Bloom post-processing for glow

### 4.2 Camera & Controls
- **Initial Position**: Elevated, slightly angled to show all three nodes
- **OrbitControls**: Damping enabled, auto-rotate slow (0.15), constrained polar angle
- **Focus**: Center of the three-node triangle

### 4.3 Node Data Structure
```tsx
const TACTICAL_NODES = [
  { id: "tactical-physical", name: "TACTICAL PHYSICAL", state: "conquered", progress: 100, position: [-80, 0, -60], color: 0x2ECC71 },
  { id: "deploy-war", name: "DEPLOY WAR", state: "active", progress: 67, position: [60, 0, -40], color: 0xFFB347 },
  { id: "reach-codeforces", name: "REACH CODEFORCES", state: "at-risk", progress: 23, position: [-10, 0, 70], color: 0xFF4D5E },
];
```

---

## PHASE 5: DAILY OPERATIONS LOG PANEL (`OperationsAARPanel.tsx` → `DailyOpsLogPanel.tsx`)

### 5.1 Visual Specification
- **Panel Background**: Same glassmorphism as left panel
- **Header**: "DAILY OPERATIONS LOG" with cyan accent dot
- **Log Entries** (from proof of concept):
  - Timestamp (HH:MM:SS)
  - Category badge: PHYSICAL (green), ALGORITHMIC (amber), SYSTEMS (cyan)
  - Message text
  - Color-coded left border on each entry

### 5.2 Log Data
```tsx
const INITIAL_LOGS = [
  { time: "06:42:13", category: "PHYSICAL", message: "Morning PT complete - 5km run, 100 pullups", color: "#2ECC71" },
  { time: "07:15:00", category: "ALGORITHMIC", message: "LeetCode Daily: Two Sum (Medium) - Solved in 12min", color: "#FFB347" },
  { time: "08:00:45", category: "SYSTEMS", message: "Architecture review: Auth service migration to NextAuth v5", color: "#4DD8E8" },
  { time: "09:30:22", category: "PHYSICAL", message: "Gym session: Push/Pull/Legs - Week 3 Day 2", color: "#2ECC71" },
  { time: "11:15:00", category: "ALGORITHMIC", message: "Codeforces Round #892 - Rating change: +24", color: "#FFB347" },
  { time: "14:00:00", category: "SYSTEMS", message: "Deploy War Room v2.3 to Vercel - Build passing", color: "#4DD8E8" },
];
```

---

## PHASE 6: BOTTOM STATUS BAR (`BottomBar.tsx` → `SystemStatusBar.tsx`)

### 6.1 Visual Specification
- **Height**: 40px
- **Background**: `rgba(5, 8, 16, 0.95)` with top border
- **Left**: System status indicators (CPU, MEM, NET, GPU)
- **Center**: Active operation status
- **Right**: Version/build info, uptime

---

## PHASE 7: 3D SCENE ENHANCEMENTS

### 7.1 Node Component (`TacticalNode`)
- **Sphere**: `SphereGeometry(28, 64, 64)` with `MeshPhysicalMaterial`
  - Emissive color matching state
  - Emissive intensity: 1.5 (conquered), 2.0 (active), 2.5 (at-risk)
  - Transmission: 0.3, thickness: 0.5 for glass-like look
- **Progress Ring**: `RingGeometry(32, 35, 128)` rotating, shows progress via arc
- **Orbiting Particles**: Small spheres orbiting active/at-risk nodes
- **Label**: HTML overlay or `Text` from drei

### 7.2 Connection Tubes (`Hyperlane`)
- **TubeGeometry** along QuadraticBezierCurve3
- **MeshPhysicalMaterial** with emissive glow
- **Animated flow**: Dashed line animation or particle system

### 7.3 Post-Processing (`WarMap3DCanvas.tsx`)
- **Bloom**: threshold 0.6, intensity 1.2, radius 0.8
- **ToneMapping**: ACESFilmic, exposure 1.6
- **Vignette**: Subtle

---

## PHASE 8: TYPOGRAPHY & DESIGN TOKENS

### 8.1 Font Usage
- **Display (Headers, Titles)**: Rajdhani 600/700
- **Mono (Data, Timestamps, Code)**: JetBrains Mono 400/600

### 8.2 Color Palette (CSS Variables)
```css
:root {
  --void: #050810;
  --void-elevated: #080c16;
  --holo-cyan: #4DD8E8;
  --holo-cyan-glow: rgba(77, 216, 232, 0.4);
  --progress-amber: #FFB347;
  --progress-amber-glow: rgba(255, 179, 71, 0.4);
  --conquest-green: #2ECC71;
  --conquest-green-glow: rgba(46, 204, 113, 0.4);
  --threat-red: #FF4D5E;
  --threat-red-glow: rgba(255, 77, 94, 0.4);
  --text-primary: #E8EEF4;
  --text-secondary: #8B9CB3;
  --text-muted: #5A6B7D;
  --panel-bg: rgba(8, 12, 22, 0.9);
  --panel-border: rgba(77, 216, 232, 0.2);
  --glass-blur: blur(16px);
}
```

---

## PHASE 9: RESPONSIVE BEHAVIOR

### 9.1 Breakpoints
- **Desktop (≥1400px)**: Full 3-column layout
- **Tablet (1024-1399px)**: Compressed side panels (260px / 320px)
- **Mobile (<1024px)**: Stacked layout - Header, 3D Canvas (50vh), Staff + Log accordion, Footer

---

## EXECUTION ORDER

1. **Phase 1-2**: Layout restructuring + CampaignHeader (new component)
2. **Phase 3**: StaffRosterPanel redesign
3. **Phase 4**: 3D Tactical Display core (nodes, connections, camera)
4. **Phase 5**: DailyOpsLogPanel redesign
5. **Phase 6**: SystemStatusBar redesign
6. **Phase 7**: 3D scene polish (materials, post-processing, animations)
7. **Phase 8**: Global design tokens & typography
8. **Phase 9**: Responsive adjustments

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `page.tsx` | **REWRITE** - New grid layout |
| `CampaignHeader.tsx` | **CREATE** - New top bar component |
| `TopHUD.tsx` | **DELETE** - Replaced by CampaignHeader |
| `StaffRosterPanel.tsx` | **REWRITE** - Match proof of concept |
| `WarMap3DCanvas.tsx` | **UPDATE** - Post-processing, camera |
| `WarMap3DCanvasInner.tsx` | **REWRITE** - Three-node tactical display |
| `OperationsAARPanel.tsx` | **DELETE** - Replaced by DailyOpsLogPanel |
| `DailyOpsLogPanel.tsx` | **CREATE** - New right panel |
| `BottomBar.tsx` | **REWRITE** → `SystemStatusBar.tsx` |
| `globals.css` / new `tactical.css` | **CREATE** - Design tokens |

---

## SUCCESS CRITERIA

- [ ] Visual match to proof of concept ≥ 90%
- [ ] All UI panels functional (hover, click, scroll)
- [ ] 3D scene runs at 60fps on modern hardware
- [ ] TypeScript strict mode passes
- [ ] No console errors/warnings
- [ ] Responsive down to 1024px width