import { prisma } from "../src/lib/prisma"

async function main() {
  console.log("🌱 Backfilling agent persona fields...");

  const agents = await prisma.agent.findMany();

  for (const agent of agents) {
    // Extract identity from systemPrompt (first paragraph before directives)
    const identity = extractIdentity(agent.systemPrompt);

    // Extract operational prompt from systemPrompt (directives section)
    const operationalPrompt = extractOperationalPrompt(agent.systemPrompt, agent.rank);

    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        identity,
        operationalPrompt,
      },
    });

    console.log(`✅ Updated ${agent.name}: identity="${identity.slice(0, 60)}..." operationalPrompt="${operationalPrompt.slice(0, 60)}..."`);
  }

  console.log("🎉 Persona fields backfilled!");
}

function extractIdentity(prompt: string): string {
  const lines = prompt.split("\n").filter(l => l.trim());
  const identityLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("Your directives:") ||
      trimmed.startsWith("When the Commander") ||
      trimmed.startsWith("Never ") ||
      trimmed.startsWith("Always ") ||
      trimmed.match(/^\d+\./)
    ) {
      break;
    }
    if (trimmed) identityLines.push(trimmed);
  }

  return identityLines.length > 0
    ? identityLines.join(" ")
    : "Agent identity";
}

function extractOperationalPrompt(prompt: string, rank: string): string {
  const lines = prompt.split("\n").filter(l => l.trim());
  const directiveLines: string[] = [];
  let inDirectives = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Your directives:") || trimmed.startsWith("Your directives")) {
      inDirectives = true;
      continue;
    }
    if (inDirectives) {
      if (trimmed.startsWith("When the Commander") || trimmed.match(/^\d+\./)) {
        break;
      }
      if (trimmed) directiveLines.push(trimmed);
    }
  }

  if (directiveLines.length > 0) {
    return directiveLines.join(" ");
  }

  // Fallback to rank-based defaults
  const rankDirectives: Record<string, string> = {
    GENERAL: "Think in campaigns, not tasks. Prioritize ruthlessly. Identify the critical path. Accept acceptable losses. Communicate with clarity and authority.",
    CAPTAIN: "Track every resource. Identify bottlenecks. Optimize the supply chain. Map dependencies. Maintain the battle rhythm.",
    SPECIALIST: "Write code that ships. Debug like a sniper. Architecture serves the mission. Technical debt is an IED. Tools are force multipliers.",
    LIEUTENANT: "Map the terrain. Synthesize signal from noise. Document everything. Accuracy over speed.",
    SERGEANT: "The daily standup is sacred. Streaks are armor. Friction is the enemy. After-action reviews. No excuses.",
  };

  return rankDirectives[rank] || "Execute your role with professional excellence.";
}

main()
  .catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });