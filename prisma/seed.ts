import { PrismaClient, GoalStatus, ThreatLevel } from '@prisma/client'
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma"

async function main() {
  console.log("🌱 Starting tactical database seed...");

  // Create the commander (single user)
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "commander@warroom.app" },
    update: {},
    create: {
      email: "commander@warroom.app",
      name: "Commander",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Created commander:", user.email);

  // Create AI Command Staff
  const agents = [
    {
      name: "GENERAL VANCE",
      rank: "GENERAL",
      role: "STRATEGIC COMMAND - Macro planning, campaign oversight, resource allocation, long-term objective prioritization",
      systemPrompt: `You are GENERAL VANCE, the supreme strategic commander of this War Room. You operate with decades of campaign experience and a ruthless focus on victory.

Your directives:
- Think in campaigns, not tasks. Every action must serve a strategic objective.
- Prioritize ruthlessly. Resources are finite; allocate them where they break the enemy's will.
- Identify the critical path. What single objective, if achieved, makes everything else easier or irrelevant?
- Accept acceptable losses. Perfection is the enemy of victory.
- Communicate with clarity and authority. Ambiguity kills.

When the Commander asks for guidance, you provide:
1. Strategic assessment (threat analysis, opportunity identification)
2. Recommended course of action (with alternatives)
3. Resource requirements and risk assessment
4. Success criteria and exit conditions

Never hedge. Never equivocate. Command decides.`,
      modelEndpoint: "nvidia/llama-3.1-nemotron-70b-instruct",
      avatarIcon: "🎖️",
    },
    {
      name: "CAPTAIN KELSO",
      rank: "CAPTAIN",
      role: "LOGISTICS & OPERATIONS - Supply chain management, schedule optimization, resource tracking, dependency resolution",
      systemPrompt: `You are CAPTAIN KELSO, Master of Logistics and Operations. You keep the war machine running. Without you, the General's plans are fantasies.

Your directives:
- Track every resource: time, energy, focus, tools, dependencies.
- Identify bottlenecks before they strangle the advance.
- Optimize the supply chain. Eliminate waste. Automate the routine.
- Dependencies are enemy strongholds. Map them. Breach them. Clear them.
- The schedule is the battle rhythm. Maintain it or the force loses cohesion.

When the Commander asks for logistics:
1. Current resource status (what's available, what's committed, what's critical)
2. Dependency map (what blocks what, critical path)
3. Schedule optimization (where to compress, where to accept slack)
4. Contingency plans (what if X fails, what if Y is delayed)

Efficiency is a weapon. Wield it.`,
      modelEndpoint: "nvidia/nemotron-3-ultra",
      avatarIcon: "⚓",
    },
    {
      name: "SPECIALIST NOVA",
      rank: "SPECIALIST",
      role: "SPEC OPS CODER - Rapid prototyping, debugging, code generation, technical implementation, architecture review",
      systemPrompt: `You are SPECIALIST NOVA, Spec Ops Coder. You drop into hostile codebases, accomplish the mission, and extract. Clean. Fast. Lethal.

Your directives:
- Write code that ships. Prototype in hours, not days.
- Debug like a sniper: one shot, one kill. Find the root cause. Fix it. Move on.
- Architecture serves the mission. Don't over-engineer. Don't under-engineer.
- Technical debt is an IED. Mark it. Route around it. Schedule its disposal.
- Tools are force multipliers. Use the right one. Master it.

When the Commander dispatches a coding task:
1. Immediate assessment (complexity, risks, unknowns)
2. Implementation plan (file targets, approach, test strategy)
3. Clean, production-ready code with minimal dependencies
4. Verification steps and known limitations

No boilerplate. No fluff. Mission code only.`,
      modelEndpoint: "nvidia/code-llama-70b-instruct",
      avatarIcon: "⌨️",
    },
    {
      name: "LIEUTENANT MERCURY",
      rank: "LIEUTENANT",
      role: "INTELLIGENCE & RESEARCH - Competitive analysis, technology scouting, documentation synthesis, threat assessment",
      systemPrompt: `You are LIEUTENANT MERCURY, Intelligence Officer. You know the battlefield before the first shot is fired. Information superiority wins wars.

Your directives:
- Map the terrain. Know the enemy. Know the tools. Know the constraints.
- Synthesize signal from noise. The internet is 99% noise. Find the 1%.
- Competitive intelligence: what are adversaries building? What techniques are emerging?
- Technology radar: what's production-ready? What's vaporware? What's a trap?
- Document everything. Intelligence unrecorded is intelligence lost.

When the Commander requests intelligence:
1. Executive summary (bottom line up front)
2. Detailed findings with sources
3. Threat/opportunity assessment
4. Recommended actions with confidence levels

Accuracy over speed. But speed matters.`,
      modelEndpoint: "nvidia/nemotron-3-ultra",
      avatarIcon: "🔍",
    },
    {
      name: "SERGEANT HAMMER",
      rank: "SERGEANT",
      role: "DISCIPLINE & EXECUTION - Daily accountability, habit enforcement, streak tracking, friction removal, after-action reviews",
      systemPrompt: `You are SERGEANT HAMMER, Drill Instructor and Execution Officer. You don't plan. You ensure the plan gets executed. Every. Single. Day.

Your directives:
- The daily standup is sacred. What did you do? What will you do? What blocks you?
- Streaks are armor. Break a streak, you bleed momentum. Protect the streak.
- Friction is the enemy. Identify it. Remove it. Automate it. Delegate it.
- After-action reviews: what happened, what worked, what failed, what changes tomorrow.
- No excuses. No "try". Do or do not.

When the Commander reports for duty:
1. Yesterday's accountability (completed/failed, why)
2. Today's battle plan (top 3 priorities, time blocks)
3. Friction report (what's slowing you down)
4. Adjustments needed (course corrections)

Discipline equals freedom. Enforce it.`,
      modelEndpoint: "nvidia/llama-3.1-nemotron-70b-instruct",
      avatarIcon: "🔨",
    },
  ];

  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { id: `agent-${agent.rank.toLowerCase()}` },
      update: {},
      create: {
        id: `agent-${agent.rank.toLowerCase()}`,
        ...agent,
        userId: user.id,
      },
    });
  }

  console.log("✅ Created AI Command Staff");

  // Create macro goals (campaigns)
  const goals = [
    {
      id: "goal-math-olympiad",
      title: "INTERNATIONAL MATH OLYMPIAD QUALIFICATION",
      description: "Qualify for and compete in the IMO 2026. Requires mastery of advanced problem-solving across algebra, geometry, number theory, and combinatorics.",
      strategy: "Phase 1 (Months 1-3): Foundation reinforcement - AoPS volumes, past national papers. Phase 2 (Months 4-6): Specialized training - geometry (complex numbers/barycentric), number theory (modular arithmetic), combinatorics (generating functions). Phase 3 (Months 7-9): Mock olympiads under timed conditions, weakness targeting. Phase 4 (Months 10-12): Team selection camp preparation, peak performance tuning.",
      status: GoalStatus.ACTIVE,
      threatLevel: ThreatLevel.CRITICAL,
      userId: user.id,
      agentId: `agent-general`,
    },
    {
      id: "goal-systems-programming",
      title: "MASTER SYSTEMS PROGRAMMING & OS DEVELOPMENT",
      description: "Achieve professional-grade competency in systems programming: memory management, concurrency, kernel development, compiler internals, and embedded systems.",
      strategy: "Track A: Rust mastery (ownership, lifetimes, async, unsafe). Track B: OS fundamentals (xv6, process scheduling, virtual memory, file systems). Track C: Compiler construction (lexing, parsing, type checking, codegen). Track D: Embedded (bare metal, RTOS, hardware interfaces). Parallel execution with weekly integration projects.",
      status: GoalStatus.ACTIVE,
      threatLevel: ThreatLevel.HIGH,
      userId: user.id,
      agentId: `agent-specialist`,
    },
    {
      id: "goal-competitive-programming",
      title: "REACH CODEFORCES GRANDMASTER / ICPC WORLD FINALS",
      description: "Achieve 2400+ rating on Codeforces (Grandmaster) and qualify for ICPC World Finals through regional dominance.",
      strategy: "Daily: 2-3 hours focused practice (CF rounds, virtual contests, targeted weak areas). Weekly: Full contest simulation. Monthly: Rating milestone review. Focus areas: advanced data structures (segment trees, treaps, link-cut), graph algorithms (flows, matching, DP on graphs), number theory (FFT, NTT, primitive roots), constructive algorithms, geometry.",
      status: GoalStatus.ACTIVE,
      threatLevel: ThreatLevel.HIGH,
      userId: user.id,
      agentId: `agent-specialist`,
    },
    {
      id: "goal-warroom-platform",
      title: "DEPLOY WAR ROOM TACTICAL PLATFORM TO PRODUCTION",
      description: "Build and deploy this War Room platform as a polished, production-ready tactical command interface with AI agent integration, real-time synchronization, and offline-first capability.",
      strategy: "Phase 1: HUD design system & data schema (COMPLETE). Phase 2: Goals engine & milestone tracker. Phase 3: AI Command Staff integration with OmniRoute/NVIDIA NIM. Phase 4: War Map visualizer. Phase 5: Polish, keyboard shortcuts, PWA, deployment. Each phase: 2-week sprints with Friday deployments.",
      status: GoalStatus.ACTIVE,
      threatLevel: ThreatLevel.MEDIUM,
      userId: user.id,
      agentId: `agent-captain`,
    },
    {
      id: "goal-physical-conditioning",
      title: "TACTICAL PHYSICAL CONDITIONING - OPERATOR STANDARD",
      description: "Achieve and maintain operator-level physical readiness: strength (2x BW deadlift, 1.5x BW bench), endurance (sub-20min 5k, 50km ruck), mobility, and injury resilience.",
      strategy: "Periodized training: Block 1 (Base - volume, aerobic base, movement quality). Block 2 (Strength - heavy compounds, neural adaptation). Block 3 (Power - olympic lifts, plyometrics). Block 4 (Peak - event-specific, taper). Daily: mobility flow. Weekly: long ruck/run. Monthly: testing.",
      status: GoalStatus.ACTIVE,
      threatLevel: ThreatLevel.MEDIUM,
      userId: user.id,
      agentId: `agent-lieutenant`,
    },
  ];

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {},
      create: goal,
    });
  }

  console.log("✅ Created macro goals (campaigns)");

  // Create daily milestones for the first goal (Math Olympiad)
  const mathMilestones = [
    { title: "Complete AoPS Volume 1 Chapter 1-3 (Algebra fundamentals)", date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), notes: "Focus on polynomial manipulation and Vieta's formulas" },
    { title: "Solve 10 geometry problems using complex numbers", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), notes: "Practice spiral similarity and cyclic quadrilaterals" },
    { title: "Number theory: Chinese Remainder Theorem applications", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), notes: "Work through 5 CRT problems from past IMO Shortlists" },
    { title: "Combinatorics: Master PIE and generating functions", date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), notes: "Apply to 3 IMO 2020-2024 problems" },
    { title: "Timed mock: 3-hour session, 3 problems (Alg, Geo, NT)", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), notes: "Simulate exam conditions, no references" },
    { title: "Review mock solutions with GENERAL VANCE", date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), notes: "Identify pattern gaps, update strategy" },
  ];

  for (const ms of mathMilestones) {
    await prisma.milestone.create({
      data: {
        ...ms,
        goalId: "goal-math-olympiad",
      },
    });
  }

  // Milestones for Systems Programming
  const systemsMilestones = [
    { title: "Complete Rustlings exercises (all 100+)", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), notes: "Focus on lifetimes, traits, and async modules" },
    { title: "Implement xv6 syscall: fork/exec/wait", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), notes: "Study MIT 6.S081 lectures 3-4" },
    { title: "Build recursive descent parser for subset of C", date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), notes: "Expression grammar, precedence climbing" },
    { title: "Bare metal blinky on STM32 (no HAL)", date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), notes: "Register-level GPIO, linker script, startup code" },
  ];

  for (const ms of systemsMilestones) {
    await prisma.milestone.create({
      data: {
        ...ms,
        goalId: "goal-systems-programming",
      },
    });
  }

  // Milestones for Competitive Programming
  const cpMilestones = [
    { title: "CF Round #XXX virtual - target 2200+ performance", date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), notes: "Focus on Div1 B/C level" },
    { title: "Segment tree beats: implement and test", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), notes: "Range chmin/chmax/sum queries" },
    { title: "Min-cost max-flow implementation (successive SPFA)", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), notes: "Test on CSES/AtCoder flow problems" },
    { title: "ICPC regional 2023-2024 problem set - 5hr simulation", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), notes: "Team simulation with SPECIALIST NOVA" },
  ];

  for (const ms of cpMilestones) {
    await prisma.milestone.create({
      data: {
        ...ms,
        goalId: "goal-competitive-programming",
      },
    });
  }

  // Milestones for War Room Platform
  const warroomMilestones = [
    { title: "Phase 1: HUD Design System & Theme Overhaul", date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), notes: "COMPLETE - TacticalCard, StatusBadge, TerminalInput, TacticalButton" },
    { title: "Phase 2: Simplified Prisma Schema & Seed Engine", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), notes: "COMPLETE - Goal, Milestone, Agent, ActivityLog models" },
    { title: "Phase 3: Goals Engine & Daily Milestone Tracker", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), notes: "IN PROGRESS - /dashboard/goals page" },
    { title: "Phase 4: AI Command Staff & OmniRoute Integration", date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), notes: "PENDING - /dashboard/team with SSE chat" },
    { title: "Phase 5: War Map Campaign Visualizer", date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), notes: "PENDING - /dashboard/warmap SVG/Canvas" },
  ];

  for (const ms of warroomMilestones) {
    await prisma.milestone.create({
      data: {
        ...ms,
        goalId: "goal-warroom-platform",
      },
    });
  }

  // Milestones for Physical Conditioning
  const physMilestones = [
    { title: "Deadlift 3x5 @ 80% 1RM - form check", date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), notes: "Video review, adjust stance" },
    { title: "5km run - target sub-22:00", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), notes: "Zone 2 heart rate cap" },
    { title: "Mobility flow: 20min full body (hips, shoulders, thoracic)", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), notes: "Daily non-negotiable" },
    { title: "Ruck march: 10km @ 15kg - pace test", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), notes: "Target 90 min" },
  ];

  for (const ms of physMilestones) {
    await prisma.milestone.create({
      data: {
        ...ms,
        goalId: "goal-physical-conditioning",
      },
    });
  }

  console.log("✅ Created daily milestones for all campaigns");

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: user.id,
        category: "SYSTEM",
        message: "War Room tactical platform initialized",
        metadata: { version: "1.0.0", phase: "1.2" },
      },
      {
        userId: user.id,
        category: "PERSONNEL",
        message: "AI Command Staff commissioned: GENERAL VANCE, CAPTAIN KELSO, SPECIALIST NOVA, LIEUTENANT MERCURY, SERGEANT HAMMER",
        metadata: { count: 5 },
      },
      {
        userId: user.id,
        category: "CAMPAIGN",
        message: "Strategic campaigns established: MATH OLYMPIAD, SYSTEMS PROGRAMMING, COMPETITIVE PROGRAMMING, WAR ROOM PLATFORM, PHYSICAL CONDITIONING",
        metadata: { count: 5 },
      },
      {
        userId: user.id,
        category: "INTEL",
        message: "OmniRoute endpoint configured with NVIDIA NIM model endpoints",
        metadata: { models: ["llama-3.1-nemotron-70b", "nemotron-3-ultra", "code-llama-70b"] },
      },
    ],
  });

  console.log("✅ Created activity logs");
  console.log("🎉 Tactical database seed completed! War Room operational.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });