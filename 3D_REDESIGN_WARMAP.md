# WarRoom — War Map 3D Redesign Implementation Prompt

You are working on WarRoom, a Next.js 16 (App Router, Turbopack) productivity app. The stack is Postgres + Prisma + Redis + NextAuth, styled with Tailwind and shadcn/ui. A 2D War Map preview exists at `/warmap-preview` but is being replaced. The AI agent layer is implemented and working; do not touch it.

Your job is to build a **3D holographic tactical display** for the War Map as a new route at `/warmap-3d-preview`. This is a design prototype. No real data. No API calls. No database. Use hardcoded fake data. The goal is to prove the 3D direction works visually before committing to it as the main view.

## Non-negotiable rules before you touch anything

1. BEFORE writing any code, inspect the existing `/warmap-preview` route in full. Read the fake data structure, the node types, the log entries, the fake milestones. You will reuse the data shape, not the 2D rendering.
2. Read the project's `package.json`. Confirm `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, and `zustand` are installed. If any are missing, stop and ask the user to install them. Do not attempt to install packages yourself unless explicitly told to.
3. Confirm the installed versions of R3F, drei, and three. R3F v9 is required for React 19 (Next.js 16). If R3F v8 is installed, stop and report the mismatch. Do not proceed.
4. Do NOT modify the existing `/warmap-preview` route. Build the 3D version as a completely separate route. Both should coexist for comparison.
5. Do NOT modify any existing pages, components, or styles outside the new route folder.
6. Do NOT wire anything to Prisma, the agents API, or any data source. Hardcoded fake data only.
7. Do NOT install new heavy dependencies. The five listed above are sufficient.
8. Verify the app builds after every significant change. Do not leave the project in a broken state.

## Critical technical rules for R3F in Next.js 16

These are non-negotiable. Violating any of them will produce broken behavior that is hard to debug.

1. **The Canvas MUST be loaded via `dynamic()` with `ssr: false`.** R3F uses `window` and WebGL, neither of which exist on the server. Create an inner component file and a separate wrapper that dynamic-imports it. The route file itself should be a server component that renders the wrapper.

2. **Never rest-spread props onto R3F intrinsic elements.** `<mesh {...props}>` silently corrupts Three.js internal state and breaks click handlers. Always destructure: `<mesh onClick={onClick} onPointerOver={onPointerOver} position={pos}>`.

3. **Never call `setState` inside `useFrame`.** `useFrame` runs 60 times per second. React state updates at that rate will destroy performance and cause infinite loops. Mutate `ref.current.position`, `ref.current.rotation`, etc. directly.

4. **Never store Three.js objects in Zustand state.** Store primitives (numbers, strings) or create new object references on update. Mutating a stored `Vector3` in place will not trigger re-renders.

5. **Wrap the entire 3D scene in `<Suspense>`** with a fallback. R3F integrates with React Suspense for loading. Without it, Strict Mode's double-mount in dev can cause WebGL context loss.

6. **Use `OrbitControls` from `@react-three/drei`**, not raw Three.js controls. It handles camera orbit, zoom, and damping correctly out of the box.

## The 3D spatial metaphor

The scene is a holographic tactical display floating in a void. The mental model: the user is standing in front of a projected command table, looking at a 3D hologram of their campaign.

### The layers (from center outward)

- **Command Core** at the origin (0, 0, 0). A glowing icosahedron or sphere. This is "you." It pulses slowly. All sectors connect to it.
- **Sectors** orbit the Command Core at varying radii and elevations. Each sector is a **translucent 3D volume** — a wireframe sphere or hexagonal prism shell — containing its goal nodes. The shell is visible as a faint glowing boundary. This is territory.
- **Goal nodes** sit inside sectors as **hexagonal discs** (flat prisms, hexagonal top face). Each goal floats at a slightly different Z height within its sector. Higher = more advanced. The disc has a progress ring around its edge.
- **Milestones** orbit their parent goal on a ring, like electrons. Small spheres. Completed milestones light up in conquest green and stop orbiting.
- **Hyperlanes** are curved 3D arcs between nodes. Use `CatmullRomCurve3` + `TubeGeometry` for the arcs. They should arc above or below the plane to avoid crossing through the Command Core. Directional flow via animated dash patterns.

### Fog of war

Fog is a **volumetric dark region** — a low-poly shape (icosahedron with displaced vertices, or just an unlit dark sphere with noise texture) that occupies map area where unexplored sectors live. Faint wireframe outline, very dark fill, a floating "?" marker. It should feel like unexplored volume, not a flat disc.

### The floor

A large translucent plane below the operation sphere at Y = -300 or similar. It has a fading grid shader (grid lines that fade with distance from center). This gives the space a floor without being a solid plane. It should be barely visible, atmospheric.

## Palette (hard limit, five colors)

Use exactly these. No others.

- **Void** `#050810` — background, near-black with a blue tint.
- **Holo Cyan** `#4DD8E8` — primary lines, labels, neutral elements.
- **Progress Amber** `#FFB347` — active campaigns, in-progress.
- **Conquest Green** `#3FE0A0` — completed, conquered.
- **Threat Red** `#FF4D5E` — at-risk, contested, failing.

Derived shades via opacity only. No new hues.

## Typography

Use the fonts already loaded in the 2D preview route: `Rajdhani` for display labels, `JetBrains Mono` for data. For 3D text, prefer `Html` from drei for labels (DOM elements rendered in 3D space) over `Text` (Three.js text geometry). `Html` is more legible, more customizable, and easier to style with the existing Tailwind setup. Use `Billboard` from drei around `Html` so labels always face the camera.

If you use drei's `Text`, be aware it may have compatibility issues with certain R3F/Next.js version combinations. Test it immediately after adding.

## Visual language in 3D

- **Command Core**: glowing icosahedron, slowly rotating, pulsing. Soft additive glow (not a hard outline). Emissive material.
- **Sector shells**: wireframe spheres or hexagonal prisms with very low opacity fill. Subtle outer glow. Each sector has a label floating above it.
- **Goal discs**: hexagonal prisms. Thin. The top face has a progress ring around the edge (torus geometry or a ring geometry rotated flat). The disc color reflects state (neutral cyan, active amber, conquered green, at-risk red).
- **Milestones**: small spheres orbiting on a ring. Completed = conquest green, emissive. Incomplete = dim cyan.
- **Hyperlanes**: thin tubes following CatmullRom curves. Animated dash flow via a shader or texture offset. Color reflects state.
- **Fog volumes**: low-poly dark shapes with a faint wireframe outline and a floating marker. Not interactive.

## Camera and interaction

- **Initial camera**: positioned to see the whole operation sphere at an angle. Something like `[0, 200, 500]` looking at origin. FOV ~50.
- **OrbitControls**: damping enabled, auto-rotate at very low speed (0.5 or less) when idle, zoom to cursor, no panning (orbit + zoom is enough).
- **Click a goal node**: camera smoothly dollies to focus it (animate the camera target and position over ~1 second using `useFrame` or a spring library). A detail panel slides in from the right.
- **Hover a goal node**: node scales up slightly, a label appears above it. Use `onPointerOver` and `onPointerOut`.
- **Click empty space**: deselect, camera returns to default view.
- **Right-click**: disable the context menu. Do not implement radial menus in this phase.

## Performance rules

- **Use `useMemo` for geometry, material, and curve objects.** Do not create new `Vector3`, `CatmullRomCurve3`, or geometries inside render.
- **Use `InstancedMesh` for milestones** if there are many. Drei's `Instances` and `Instance` helpers work well for this.
- **Limit node count.** 8–12 goal nodes, 3–4 sectors, 2–3 fog volumes. This is a prototype; do not stress-test performance.
- **Disable shadows.** No shadow maps. Use emissive materials and postprocessing bloom instead.
- **Postprocessing**: use `EffectComposer` from `@react-three/postprocessing` with a subtle `Bloom` pass (luminanceThreshold ~0.8, intensity ~0.5) and optionally a `Vignette`. Do not stack many effects. Bloom is what sells the holographic look.

## What to build, in this exact order

1. **Package verification.** Confirm `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, and `zustand` are installed and version-compatible. Report what you find. Stop if anything is missing or mismatched.
2. **Route scaffold.** Create `/warmap-3d-preview` with the dynamic-import wrapper and a minimal inner Canvas component. Confirm a black Canvas renders with no errors.
3. **Command Core.** Add a single glowing icosahedron at the origin with a pulse animation. Confirm it renders and animates.
4. **Camera and controls.** Add `OrbitControls` with damping and auto-rotate. Confirm orbit and zoom work.
5. **Floor plane.** Add the fading grid floor. Confirm it reads as atmospheric, not distracting.
6. **Sector shells.** Add 3 sector volumes at different radii and elevations. Wireframe spheres or prisms. Confirm they read as distinct regions.
7. **Goal discs.** Add 8 goal nodes inside the sectors. Hexagonal prisms with progress rings. Neutral state only for now.
8. **Node states.** Give some nodes active, conquered, and at-risk states. Confirm they read clearly in 3D.
9. **Milestones.** Add orbiting milestones for 2–3 goals. Confirm they animate correctly and completed ones light up.
10. **Hyperlanes.** Add curved tubes from Command Core to each sector hub, and from sector hubs to goal nodes. Add animated flow. This is the hardest step; verify curves do not pass through the Command Core.
11. **Fog volumes.** Add 2–3 fog regions. Confirm they read as unexplored.
12. **Labels.** Add billboarded `Html` labels for sectors and goals. Confirm they are legible from all angles.
13. **Postprocessing.** Add Bloom and optionally Vignette. Tune to subtle. This is what makes it feel holographic.
14. **Selection and detail panel.** Clicking a goal node focuses the camera and opens a detail panel. The panel content can be a placeholder with the node name, progress, and a fake milestone list. The panel is a DOM overlay, not 3D.
15. **Polish pass.** Tune glow intensities, animation timings, camera damping, label sizes, bloom threshold. Make it feel cinematic, not functional.

## What NOT to build in this phase

- No real data from Prisma or any API.
- No radial menus.
- No sound.
- No time scrubbing.
- No mobile layout.
- No accessibility work.
- No interaction with the existing 2D preview.

## What to report back

When done, report:
- The exact route to view the 3D mockup.
- The installed versions of three, R3F, drei, and postprocessing.
- Any compatibility issues you encountered and how you resolved them.
- Any place where the 3D spec was ambiguous and what you chose.
- Any performance issues observed.
- A short list of the weakest visual elements, so the user knows where to focus iteration.

Do not declare the task complete until the 3D scene looks like a coherent holographic tactical display, not a 3D graph in space. If it looks like a math visualization, it is wrong. If it looks like a command bridge projection, it is right.
