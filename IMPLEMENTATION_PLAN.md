# WarRoom — War Map Static Mockup Implementation Prompt

You are working on WarRoom, a Next.js 16 (App Router, Turbopack) productivity app that gamifies personal goals as a sci-fi military campaign. The stack is Postgres + Prisma + Redis + NextAuth, styled with Tailwind and shadcn/ui. The AI agent layer is already implemented and working. Do not touch it.

Your job is to build a **static visual mockup** of the War Map — the central strategic view of the app. This is a design-first task. No real data. No API calls. No database. No state beyond local React state for selection and hover. The goal is to nail the look and feel before anything is wired up.

This is Phase 2 of a six-phase redesign. Later phases will extract components, wire data, add interaction, and polish. You are building the disposable prototype that everything else will be based on. Treat it as a design study, not production code.

## Non-negotiable rules before you touch anything

1. BEFORE writing any code, inspect the current project structure. Read the existing app router layout, the global stylesheet, the Tailwind config, the shadcn/ui setup, the font configuration, and the current War Map implementation if one exists. Understand the existing conventions before adding anything.
2. Produce a short written summary of what you found BEFORE writing code: the fonts already installed, the Tailwind theme tokens already defined, the existing color system, the existing component conventions. Flag any conflicts between the design spec below and what exists.
3. Do NOT modify any existing pages, routes, components, or styles. Build the mockup as a completely isolated route at `/warmap-preview` with its own self-contained styles scoped to that route. If you need to add fonts or theme tokens, do so in a way that doesn't affect the rest of the app — prefer route-scoped CSS variables and a route-scoped font import over global changes.
4. Do NOT wire anything to Prisma, the agents API, or any existing data source. Use hardcoded fake data defined inside the mockup route file.
5. Do NOT touch the AI agent code, the chat route, the memory system, or the Telegram adapter. They are out of scope.
6. Do NOT install new heavy dependencies. If you need an animation library, use Framer Motion only if it is already installed. If you need a canvas library, prefer plain canvas or SVG over adding a new package. If you absolutely must add a dependency, ask first and justify it.
7. Verify the app builds and runs after every significant change. Do not leave the project in a broken state.

## The design direction

The War Map is a **holographic tactical display**, not a webpage. The mental model is: the user is standing in front of a projected command table, and the entire view is what that projection looks like from their side. Everything on screen should feel like it is being rendered by a machine in-world, not drawn by a designer for a consumer.

The aesthetic is a fusion of three references:
- **XCOM 2 Geoscape** — a strategic layer floating above a globe, region-based threat with color temperature, a sense of time passing, assets placed on regions rather than listed.
- **Stellaris galaxy view** — spiral structure, hyperlanes between nodes, territory ownership, fog of war, sectors.
- **Star Wars tactical displays** — monochrome base with one accent, scanlines and bloom, concentric rings and radial menus, stencil or monospace typography, a fleet/battle-group metaphor.

The rule for every decision: if it feels like a consumer dashboard, it is wrong. If it feels like a targeting computer, it is right.

## Palette (hard limit, five colors)

Use exactly these colors. No others. Derived shades are allowed only by adjusting opacity, never by introducing new hues.

- **Void** `#050810` — deep background, near-black with a hint of blue.
- **Holo Cyan** `#4DD8E8` — primary UI lines, labels, neutral elements. This is the "ink."
- **Progress Amber** `#FFB347` — active campaigns, in-progress, currently engaged.
- **Conquest Green** `#3FE0A0` — completed, secured, conquered.
- **Threat Red** `#FF4D5E` — at-risk, overdue, contested, failing.

If the app already has a theme system, do NOT override it globally. Define these as route-scoped CSS variables inside the mockup route.

## Typography (two fonts maximum)

- **Display / labels:** a technical condensed sans or stencil. Prefer `Rajdhani`, `Orbitron`, `Chakra Petch`, or `Share Tech Mono` from Google Fonts. Use for headers, node labels, tactical readouts. All caps for labels.
- **Body / data:** a clean monospace. Prefer `JetBrains Mono`, `IBM Plex Mono`, or fall back to the existing monospace font if one is already in the project. Use for any text longer than a label.

Load these as route-scoped fonts if possible. If Next.js font optimization requires global loading, import them and use them only within the mockup route's class scope.

## Shape language

- Nodes are **hexagons**. Use SVG polygons or CSS clip-path, not a library.
- Panels have **chamfered corners** — angled cuts at the corners, not rounded corners. Thin 1px borders. Occasional corner bracket accents (small L-shaped marks at panel corners) for technical feel.
- Connections between nodes are **curved hyperlanes**, not straight lines. Use SVG quadratic or cubic bezier paths.
- Every element has a **subtle outer glow**, never a drop shadow. Use `filter: drop-shadow()` with the element's own color at low opacity, or box-shadow with a colored spread.
- No rounded corners anywhere except progress rings and circular UI elements.

## Motion grammar

Keep motion subtle and constant. The display should feel alive, never busy.

- **Background:** a slowly rotating galaxy or starfield at very low opacity (10–15%). Should never compete with foreground content. Acceptable approaches: an SVG spiral with slow rotation, a canvas starfield with slow drift and parallax, or a very subtle animated gradient with noise. Choose the cheapest approach that looks good. No particles, no explosions, no flashes.
- **Nodes:** pulse gently when active (a slow breathing animation, 3–4 second cycle), flicker briefly on hover, stay static when idle. Do not animate every node simultaneously in the same phase — offset the animation delays so the map feels organic.
- **Hyperlanes:** animated dash flow along the direction of progress. Use SVG `stroke-dasharray` + `stroke-dashoffset` animation. Speed should indicate momentum — faster for recently active goals, slower or static for stalled ones.
- **Transitions:** when selecting a node, the detail panel should appear with a scanline wipe or a holographic materialize effect, not a fade. When deselecting, reverse.

Do not add motion that isn't listed here without asking.

## Layout

The viewport is divided into four zones:

1. **Top bar (thin, ~48px).** Mission title on the left in display font all caps (e.g., "CAMPAIGN VISUALIZER — TACTICAL OVERVIEW"). On the right, a minimal status strip: a live clock, count of active fronts, count of conquered objectives. Everything in holo cyan, small, all caps.
2. **Central map canvas.** Occupies the majority of the viewport. Contains the galaxy background, the nodes, the hyperlanes, the fog, the command center at the center, and the tactical readout in a corner. This is where the eye lives.
3. **Right detail panel (~360px, collapsible).** Empty until a node is selected. When selected, slides in with the scanline transition and shows: node name, type, progress ring with percentage, list of milestones, list of recent log entries, and a placeholder for agent comms. All in holo cyan and amber. Chamfered corners, thin borders, corner brackets.
4. **Bottom bar (thin, ~40px).** Tactical readout — a live-scrolling log of fake events rendered like a targeting computer feed ("14:22 — MILESTONE SECURED — 5K TIME"). Events fade as new ones appear. Keep the last 5–8 visible.

Add a legend in a corner of the map canvas: a small panel showing the five palette colors with their meanings. Interactive in a later phase; static for now.

## The map contents (fake data)

Design the map to contain:

- **One command center node** at the center of the canvas. Larger than the others, distinct shape (maybe an octagon or a double hexagon), always pulse-active. This is "the user."
- **Five to eight goal nodes** arranged in a rough spiral around the command center, as if they orbit it. Use a spiral layout, not a grid, not a circle. Stagger them so the map reads as organic, not mathematical.
- **Hyperlanes** connecting each goal node back to the command center, and connecting some goal nodes to each other where they are related. Use curved paths. Animate flow toward the command center for completed goals and away from it for in-progress goals.
- **Two to three of the goal nodes should be visually distinct:**
  - One **conquered** — full conquest green, static, with a "CONQUERED" tag.
  - One **in progress** — progress amber, pulsing, with a progress ring around the hexagon showing a percentage.
  - One **at risk** — threat red, flickering intermittently, with a "CONTACT" or "AT RISK" tag.
  - The rest are neutral holo cyan with small progress indicators.
- **Fog of war** on two or three positions where future goals might go — dark regions with faint question marks or unknown markers. These are not interactive in this phase.

Fake the goal names with on-theme titles that fit the war-room framing without being silly. Examples: "TACTICAL PHYSICAL," "DEPLOY WAR," "REACH CODEFORCES," "MASTER SYSTEMS," "INTERNATIONAL MATH." Use these or invent similar ones. Keep them short.

## What to build, in this exact order

1. **Route scaffold.** Create the `/warmap-preview` route. Confirm it renders a blank page with the void background color.
2. **Galaxy background.** Add the slowly rotating starfield or spiral galaxy at low opacity. Verify it looks good and stays out of the way. Do not proceed until this feels right — it sets the tone for everything else.
3. **Layout skeleton.** Add the four-zone layout (top bar, map canvas, right panel space, bottom bar) with placeholder text in each zone. Confirm the proportions feel right at typical viewport sizes.
4. **Node primitives.** Build a single hexagon node component with SVG. Give it a label, a progress ring, and a state prop (neutral, active, conquered, at-risk). Render one of each state in a row on the canvas to check the visual language.
5. **Position nodes on the spiral.** Replace the test row with the real spiral layout. Add the command center at the center. Verify positions look organic.
6. **Hyperlanes.** Draw curved SVG paths between nodes. Add the animated dash flow. Tune the curve control points so paths don't cross awkwardly.
7. **Fog of war.** Add two or three fogged positions with faint markers.
8. **Legend.** Add the legend panel in a corner of the canvas.
9. **Selection interaction.** Clicking a node should open the right detail panel with the scanline transition. Clicking empty space closes it. Local React state only.
10. **Detail panel contents.** Fill the detail panel with the node name, progress ring, fake milestone list, and fake log entries. Use the display and monospace fonts correctly.
11. **Top bar and bottom bar.** Fill them with the described content — mission title, clock, counts, tactical readout feed. Fake events can be static or cycle through a small array with a timer.
12. **Polish pass.** Tune glows, animation timings, font sizes, and spacing. This is where you make it feel premium rather than functional.

## What NOT to build in this phase

- No real data from Prisma or any API.
- No agent comms integration — a placeholder panel is fine.
- No radial menus (that is Phase 5).
- No sound (that is Phase 6).
- No time scrubbing (that is Phase 5).
- No mobile layout. Desktop only for this mockup. Mobile is a later concern.
- No accessibility polish. This is a visual prototype; accessibility comes when it is extracted into production components.

## What to report back

When done, report:

- The exact route to view the mockup (`/warmap-preview`).
- Which fonts you used and how you loaded them.
- Which technique you used for the galaxy background and why.
- Any dependencies you added, with justification.
- Any place where the design spec was ambiguous and what you chose.
- Anything you could not do or that contradicts this prompt.
- A short list of the things you think look weakest, so the user knows where to focus iteration.

Do not declare the task complete until the mockup looks like a coherent piece of a sci-fi tactical display, not a React page with hexagons on it. If it looks like a dashboard, it is wrong. If it looks like a targeting computer, it is right.
