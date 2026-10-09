# CRITICAL POLISH & FINAL FEATURE IMPLEMENTATION: 3D Tactical Command Center (/warmap-3d-preview)

You have successfully built the structural layout, top HUD, left staff roster, right AAR operations panel, and basic 3D canvas for `/warmap-3d-preview`. 

However, visual comparison against our design target reveals that several key atmospheric, interactive, and spatial features are missing or underdeveloped. Your task is to implement the following **four major enhancements** to achieve a cinematic, high-end holographic command center aesthetic.

---

## 1. Cinematic Post-Processing & Neon Vibrancy Upgrade (`WarMap3DCanvas.tsx`)
The current scene lacks the high-contrast holographic glow shown in the design concept.
- **Bloom & Tone Mapping:** Update the `EffectComposer` settings. Increase `Bloom` intensity to `0.8` or `1.0` (with a luminance threshold around `0.75`) so that emissive materials and hyperlanes truly bloom against the void.
- **Tone Mapping Exposure:** In the `Canvas` `onCreated` callback, ensure `gl.toneMappingExposure` is set to `1.4` or higher to boost overall brightness and clarity.
- **Material Glow:** Boost emissive properties and opacity across core elements, hyperlanes, and nodes so they pop dynamically from the dark background (`#050810`).

---

## 2. Holographic Command Console Table Base (`WarMap3DCanvasInner.tsx`)
The map currently floats in an isolated void without physical perspective anchoring.
- **Implement a Projector Base:** Add a 3D command console projector base at the bottom-center of the tactical viewport (positioned near `[0, -75, 120]`). 
- **Visual Design:** Construct a sleek, low-profile sci-fi hardware bezel or console shape using simple geometries (e.g., flat beveled box or layered rings with a glowing core slot) that looks like a projector emitting the entire 3D hologram upward.
- Alternatively, render a refined CSS/DOM overlay or 3D chassis element that frames the bottom of the canvas, giving the user the psychological perspective of standing at a physical command desk.

---

## 3. Volumetric Fog Anomalies & "Unknown Sectors" (`FogVolume` component)
The current unknown sectors look like plain, uninspired translucent spheres.
- **Replace Plain Spheres:** Upgrade fog volumes into jagged, low-poly wireframe anomalies using `DodecahedronGeometry` or displaced `IcosahedronGeometry` with variable vertex scaling to create an irregular, ominous storm-cloud or asteroid-cluster silhouette.
- **Atmospheric Effects:** Apply a dark, near-black fill (`#020408`) with a faint cyan/amber wireframe grid outline (`opacity: 0.3`).
- **Warning Glyphs:** Ensure each fog anomaly features crisp, billboarded HTML/Text warning labels (`UNKNOWN SECTOR [REDACTED]`) paired with a pulsing caution symbol (`?`) floating above the volume.

---

## 4. Orbiting Milestone Spheres & Progress Rings (`Milestone` / `GoalNode` components)
Goal nodes currently lack their sub-component hierarchy.
- **Orbiting Milestones:** Implement electron-like orbiting marker spheres for active and completed goal nodes. 
- **Animation & State:** Milestones must orbit their parent goal node smoothly using time-based math in `useFrame`. Completed milestones must glow in **Conquest Green** (`#3FE0A0`) with a pulsing emissive aura, while uncompleted milestones remain dim cyan.
- **Progress Rings:** Ensure every active goal node features a crisp flat ring geometry around its top face reflecting its exact percentage progress via arc length or shader offset.

---

## Strict Implementation Guidelines
- **Zero Regressions:** Do not break existing UI panels (Staff Roster, AAR logger, Top HUD, Bottom Ticker) or Zustand state bindings.
- **Performance:** Keep all geometries and materials memoized using `useMemo`. Avoid creating new objects inside the render loop.
- **TypeScript:** Maintain strict typing across all components with zero `any` declarations.