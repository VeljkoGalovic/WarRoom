# Task 1: Add Central Holo-Emitter Base & Projector Lighting

To ground our holographic map visually (rather than having spheres float in mid-air), please add a physical industrial projector base at the origin with an upward lighting effect:

## 1. Create 3D Projector Pedestal Mesh
- Add a 3D mesh at position `[0, 0, 0]` representing an industrial sci-fi projector base/console (e.g., stacked cylinders, hexagonal metallic plates, or custom geometry).
- Apply a dark metallic material with subtle emissive details (`metalness: 0.9, roughness: 0.2`).

## 2. Upward Volumetric Light Beam / Spotlight
- Position a `spotLight` or a custom semi-transparent cylindrical cone mesh directly above the emitter pointing upward.
- Use a soft cyan/blue color (`#38bdf8`) with low intensity so it creates a subtle atmospheric light beam shooting up into the center of the node cluster.


# Task: 2 Add Topological Contour Lines & Sector Ground Labels

Let's enhance the infinite grid floor so it has topographic depth and sci-fi sector markings reminiscent of the concept art:

## 1. Topological Contour Lines
- If using a shader or texture on the floor plane, integrate a procedural noise/contour function or height-map ring effect so subtle topographic elevation lines ripple across the grid surface.
- Keep the opacity low (`< 0.2`) so it remains a background detail.

## 2. Ground-Plane HUD Text Tags
- Add localized text labels on the floor grid (using `<Html>` from `@react-three/drei` or 3D text geometry) for sector identifiers (e.g., `"DSA SECTOR"`, `"SECTOR 01"`, `"OPTIMIZATION ZONE"`).
- Style them with monospace typography, small sizes, and low opacity to look like projected floor graphics.


# Task 3: Add Atmospheric Particle Field & Rising Motes

The scene needs organic life and atmospheric depth. Let's add a micro-particle dust field around the nodes:

## 1. Floating Dust Particle System
- Implement a particle system (using `@react-three/drei`'s `<Sparkles />` or a custom `Points` geometry) centered around the node cluster area.
- Configure particles to have a slow, gentle upward drift and subtle turbulence/swirling motion.

## 2. Particle Styling
- Use tiny point sizes (`0.2` to `0.8`), soft circular blending, and muted cyan/amber colors to match the node palette.
- Keep particle count controlled (~200-300) so it doesn't cause performance drops or clutter the view.


# Task 4: Upgrade Node Spheres with Holographic Wireframes & Orbital Rings

Let's transform the solid colored translucent balls into detailed planetary/holographic goal globes with crisp orbital rings:

## 1. Holographic Sphere Overlays
- Update node sphere materials to include an inner glowing core mesh and a wireframe or latitude-longitude grid texture overlay (using wireframe materials or custom UV line shaders).

## 2. Refine Orbital Rings
- Replace thick, heavy outer rings with **thinner, multi-layered orbital tracks** (using `TorusGeometry` with a thin radius).
- Add a tiny glowing satellite marker mesh orbiting along each ring path using a simple `useFrame` rotation loop.


# Task 5: Upgrade Connection Lines to Animated Energy Beams

The current connection lines are static solid arcs. Let's bring them to life with animated energy flow:

## 1. Dynamic Bezier Tube Curves
- Ensure connection paths are rendered as 3D tubes (`TubeGeometry` along a quadratic/cubic bezier curve).

## 2. Flowing Energy Animation
- Implement an animated texture offset, shader dash pattern, or glowing particles traveling along the tube path from source to target.
- Add a subtle pulsing emissive glow to the curves so active goals look like they are actively transmitting data streams.