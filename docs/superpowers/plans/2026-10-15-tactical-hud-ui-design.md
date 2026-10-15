# Tactical HUD UI Design Philosophy - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the warmap tactical HUD UI design philosophy (glassmorphism, monospace fonts, amber/cyan/green/red color system, reticle corners, scanline overlays, glow effects, centralized HUD component library) across the entire WarRoom application.

**Architecture:** The warmap already uses a centralized HUD component library (TacticalCard, StatusBadge, TacticalButton, TerminalInput) with design tokens in hud-theme.ts. This plan extends that design system to DashboardLayout (glassmorphism background + reticle corners), Sidebar (tactical nav items with StatusBadge), TopNav (TacticalButton for theme toggle, TerminalInput for search), and ensures all warmap panels use HUD components instead of CSS modules.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS, TypeScript, @react-three/fiber, Zustand, hud-theme.ts design tokens

**Spec:** This plan applies the existing warmap design system (src/styles/hud-theme.ts, src/components/hud/*) to the broader application layout and pages.

## Global Constraints

- Use centralized hud-theme.ts design tokens for all colors, spacing, sizing, typography, motion, effects, zIndex
- Use TacticalCard, StatusBadge, TacticalButton, TerminalInput components consistently
- Glassmorphism: `bg-background-elevated/50 backdrop-blur-lg border border-card-border`
- Monospace fonts: font-mono (JetBrains Mono) for data, font-display (Rajdhani) for headers
- Color system: primary (cyan #4DD8E8), secondary (amber #FFB347), success (green #2ECC71), destructive (red #FF4D5E)
- Reticle corners on all TacticalCard components via `withReticle` prop
- Scanline overlay on TacticalCard via built-in pseudo-element
- Glow effects via `*-glow` color tokens and box-shadow utilities
- No CSS modules for new HUD-styled components - use Tailwind + hud-theme tokens
- Prisma only in API routes via src/lib/prisma.ts singleton
- Data fetching: plain fetch() to internal REST routes in useEffect

## Review Focus

1. **Color token consistency** - All components must use hud-theme.ts color tokens (primary, secondary, destructive, success, muted) not hardcoded hex values
2. **Glassmorphism layering** - Background transparency + backdrop-blur must not create readability issues on dark backgrounds
3. **Reticle corner alignment** - Reticle corners on nested TacticalCards must not visually conflict
4. **Font loading** - Rajdhani and JetBrains Mono must be available globally or loaded per-route
5. **StatusBadge variant coverage** - All status states across the app must map to existing StatusBadge variants

---

### Task 1: Update DashboardLayout with Glassmorphism Background and Reticle Corners

**Files:**
- Modify: `src/components/layout/DashboardLayout.tsx`
- Test: Manual verification in browser

**Interfaces:**
- Consumes: Existing DashboardLayoutProps interface
- Produces: Updated DashboardLayout with glassmorphism background and reticle corner frame

- [ ] **Step 1: Add glassmorphism background layer with reticle corner frame**

```tsx
// In DashboardLayout.tsx, replace the root div with:
<div className="min-h-screen bg-background relative">
  {/* Glassmorphism background layer */}
  <div className="fixed inset-0 bg-background-elevated/30 backdrop-blur-xl pointer-events-none" />
  {/* Reticle corner frame around entire viewport */}
  <div className="fixed inset-4 pointer-events-none border border-card-border rounded-xl">
    <div className="absolute -top-px -left-px w-8 h-8 border-t border-l border-primary/50" />
    <div className="absolute -top-px -right-px w-8 h-8 border-t border-r border-primary/50" />
    <div className="absolute -bottom-px -left-px w-8 h-8 border-b border-l border-primary/50" />
    <div className="absolute -bottom-px -right-px w-8 h-8 border-b border-r border-primary/50" />
  </div>
  {/* Existing content */}
</div>
```

- [ ] **Step 2: Add scanline overlay to main content area**
- [ ] **Step 3: Ensure Sidebar and TopNav sit above glassmorphism layer (z-index)**
- [ ] **Step 4: Test visual result in browser - verify glassmorphism depth and reticle corners visible**

---

### Task 2: Update Sidebar with Tactical Navigation Items and StatusBadge Indicators

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Test: Manual verification in browser

**Interfaces:**
- Consumes: Existing SidebarProps interface
- Produces: Updated Sidebar with tactical styling, StatusBadge for active/online indicators

- [ ] **Step 1: Import StatusBadge and TacticalCard from HUD components**

```tsx
import { StatusBadge } from "@/components/hud/StatusBadge";
import { TacticalCard, TacticalCardContent } from "@/components/hud/TacticalCard";
```

- [ ] **Step 2: Wrap navigation in TacticalCard with reticle corners**

```tsx
<TacticalCard variant="default" withReticle className="h-full flex flex-col">
  <TacticalCardContent className="flex-1 p-4 space-y-1 overflow-y-auto">
    {/* navigation items */}
  </TacticalCardContent>
</TacticalCard>
```

- [ ] **Step 3: Update navigation items to use tactical styling with StatusBadge for active state**

```tsx
{navigation.map((item) => {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      key={item.name}
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-mono uppercase tracking-wider transition-all duration-150 group relative",
        isActive
          ? "bg-primary/10 text-primary border-l-2 border-primary"
          : "text-foreground-muted hover:bg-accent hover:text-foreground"
      )}
      title={isCollapsed ? item.name : undefined}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.name}</span>
          {isActive && <StatusBadge variant="active" showPulse />}
        </>
      )}
    </Link>
  );
})}
```

- [ ] **Step 4: Update collapsed sidebar logo area with tactical styling**
- [ ] **Step 5: Add StatusBadge to version footer showing system status**
- [ ] **Step 6: Test sidebar collapsed/expanded states, active navigation highlighting**

---

### Task 3: Update TopNav with TacticalButton for Theme Toggle and TerminalInput for Search

**Files:**
- Modify: `src/components/layout/TopNav.tsx`
- Test: Manual verification in browser

**Interfaces:**
- Consumes: Existing TopNav component structure
- Produces: Updated TopNav using TacticalButton (theme toggle, notifications, user menu) and TerminalInput (search)

- [ ] **Step 1: Import TacticalButton, TerminalInput from HUD components**

```tsx
import { TacticalButton } from "@/components/hud/TacticalButton";
import { TerminalInput } from "@/components/hud/TerminalInput";
```

- [ ] **Step 2: Replace search input with TerminalInput**

```tsx
<TerminalInput
  type="search"
  placeholder="SEARCH TACTICAL DATABASE..."
  className="w-64 sm:w-80"
  onFocus={(e) => { e.target.blur(); setCommandPaletteOpen(true); }}
  readOnly
  prefix={<Search className="h-4 w-4 text-foreground-muted" />}
/>
```

- [ ] **Step 3: Replace theme toggle Button with TacticalButton (icon variant)**

```tsx
<TacticalButton
  variant="ghost"
  size="icon"
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  aria-label="Toggle theme"
>
  {!mounted ? <div className="h-5 w-5" /> : theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
</TacticalButton>
```

- [ ] **Step 4: Replace notifications Button with TacticalButton**
- [ ] **Step 5: Replace user dropdown trigger Button with TacticalButton**
- [ ] **Step 6: Update DropdownMenu to use TacticalCard styling (or replace with custom tactical dropdown)**
- [ ] **Step 7: Update mobile menu navigation to use TacticalButton**
- [ ] **Step 8: Test theme toggle, search focus, notifications, user dropdown, command palette trigger**

---

### Task 4: Update WarMap Panels to Use HUD Components (Remove CSS Modules)

**Files:**
- Modify: `src/app/dashboard/warmap/TopHUD.tsx` (remove TopHUD.module.css)
- Modify: `src/app/dashboard/warmap/StaffRosterPanel.tsx` (remove StaffRosterPanel.module.css)
- Modify: `src/app/dashboard/warmap/DailyOpsLogPanel.tsx` (remove DailyOpsLogPanel.module.css)
- Modify: `src/app/dashboard/warmap/BottomBar.tsx` (remove BottomBar.module.css)
- Modify: `src/app/dashboard/warmap/OperationsAARPanel.tsx` (remove OperationsAARPanel.module.css - already uses inline styles)
- Delete: All `.module.css` files in `src/app/dashboard/warmap/`
- Test: Manual verification in browser, ensure all panels render correctly

**Interfaces:**
- Consumes: Zustand store (useWarMapStore), warmap types
- Produces: All panels using TacticalCard, StatusBadge, TerminalInput, TacticalButton with hud-theme.ts tokens

- [ ] **Step 1: TopHUD - Replace with TacticalCard wrapper, use StatusBadge for status items, use hud-theme color tokens**

```tsx
// Replace CSS module classes with Tailwind + hud-theme tokens
// Use TacticalCard variant="active" withReticle for container
// Status items use StatusBadge variants: active, complete, destructive
// Progress bar uses tactical progress styling from hud-theme
```

- [ ] **Step 2: StaffRosterPanel - Convert to TacticalCard with reticle, StaffCard as TacticalCard sub-component, StatusBadge for status**

```tsx
// Wrap entire panel in TacticalCard variant="default" withReticle
// Each staff member as TacticalCard variant="default" withReticle
// Status indicators use StatusBadge variants: "active" (ONLINE), "deploying" (DEEP FOCUS), "standby" (STANDBY)
// Progress bars use tactical progress styling
// Corner notches handled by TacticalCard's withReticle
```

- [ ] **Step 3: DailyOpsLogPanel - Convert to TacticalCard, LogEntryItem as tactical styled items, StatusBadge for categories**

```tsx
// Wrap in TacticalCard variant="default" withReticle
// Log entries use tactical typography (font-mono, text-timestamp)
// Category badges use StatusBadge with appropriate variants
// Animation classes from hud-theme.motion.animations
```

- [ ] **Step 4: BottomBar - Convert to TacticalCard footer style, rotating log entries with tactical styling**

```tsx
// Wrap in TacticalCard variant="default" withReticle (or just tactical styling)
// Log entries use font-mono, text-timestamp
// Category badges use StatusBadge
```

- [ ] **Step 5: OperationsAARPanel - Replace inline styles with hud-theme tokens, use TacticalCard, StatusBadge, TacticalButton, TerminalInput**

```tsx
// Replace all hardcoded colors with hud-theme color tokens
// Directives use StatusBadge variants
// Progress ring use tactical progress styling
// Milestones use StatusBadge for completed/pending
// AAR Logger form uses TerminalInput, TerminalTextarea, TacticalButton
```

- [ ] **Step 6: Delete all `.module.css` files in warmap directory**
- [ ] **Step 7: Test all panels render correctly, verify glassmorphism, reticle corners, color consistency**

---

### Task 5: Verify Goals and Team Pages Already Use HUD Components (Audit Only)

**Files:**
- Read: `src/app/dashboard/goals/GoalsClient.tsx` (verify)
- Read: `src/app/dashboard/team/TeamClient.tsx` (verify)
- Test: Manual verification

**Interfaces:**
- Consumes: Existing GoalsClient and TeamClient components
- Produces: Confirmation that they already follow the design system

- [ ] **Step 1: Verify GoalsClient uses TacticalCard, StatusBadge, TerminalInput, TacticalButton consistently**
- [ ] **Step 2: Verify TeamClient uses TacticalCard, StatusBadge, TerminalInput, TerminalTextarea, TacticalButton consistently**
- [ ] **Step 3: Check for any hardcoded colors that should use hud-theme tokens**
- [ ] **Step 4: Check for any CSS modules that should be removed**
- [ ] **Step 5: Document any minor inconsistencies for future cleanup**

---

### Task 6: Add Global Font Loading for Rajdhani and JetBrains Mono

**Files:**
- Modify: `src/app/layout.tsx` (or create route-specific font loading)
- Test: Verify fonts load correctly across all dashboard pages

**Interfaces:**
- Consumes: Next.js font optimization
- Produces: Global CSS variables for --wm-font-display and --wm-font-mono

- [ ] **Step 1: Add font loading in root layout or create font utility**
- [ ] **Step 2: Ensure CSS variables are available globally: --wm-font-display, --wm-font-mono**
- [ ] **Step 3: Update Tailwind config if needed for font family utilities**
- [ ] **Step 4: Test font rendering on all dashboard pages**

---

### Task 7: Integration Testing and Visual Polish

**Files:**
- All modified files
- Test: Full dashboard navigation flow

**Interfaces:**
- Consumes: All previous tasks
- Produces: Cohesive tactical HUD experience across entire app

- [ ] **Step 1: Navigate through all dashboard pages (Overview, Goals, Command Staff, War Map, Settings)**
- [ ] **Step 2: Verify consistent glassmorphism, reticle corners, color system**
- [ ] **Step 3: Verify StatusBadge variants used correctly across all pages**
- [ ] **Step 4: Verify TacticalButton variants used correctly**
- [ ] **Step 5: Verify TerminalInput used for all search/input fields**
- [ ] **Step 6: Check responsive behavior (mobile sidebar, collapsed sidebar)**
- [ ] **Step 7: Verify no console errors, TypeScript errors**
- [ ] **Step 8: Run build to ensure production compilation succeeds**

```bash
npm run build
```

- [ ] **Step 9: Commit all changes**

```bash
git add -A
git commit -m "feat: apply tactical HUD UI design philosophy across entire WarRoom app

- DashboardLayout: glassmorphism background, reticle corner frame
- Sidebar: TacticalCard wrapper, StatusBadge for active nav items
- TopNav: TacticalButton for theme/notifications/user, TerminalInput for search
- WarMap panels: All converted from CSS modules to HUD components
- Consistent hud-theme.ts tokens throughout

Co-Authored-By: Claude Code <noreply@anthropic.com>
```