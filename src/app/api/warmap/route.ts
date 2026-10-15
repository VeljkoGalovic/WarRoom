import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GoalMapNode {
  id: string;
  name: string;
  state: "neutral" | "active" | "conquered" | "at-risk" | "command";
  progress: number;
  threatLevel: string;
  status: string;
  position: [number, number, number];
  agentId: string | null;
  milestoneCount: number;
  completedMilestones: number;
}

interface AgentMapNode {
  id: string;
  name: string;
  role: string;
  rank: string;
  avatarIcon: string;
  isActive: boolean;
  position: [number, number, number];
}

interface Connection {
  from: string;
  to: string;
  type: "goal-goal" | "agent-goal";
}

interface WarMapStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  criticalGoals: number;
  totalAgents: number;
  activeAgents: number;
  averageProgress: number;
  lastUpdated: string;
}

function mapNodeState(status: string, threatLevel: string): GoalMapNode["state"] {
  if (status === "COMPLETED") return "conquered";
  if (status === "ARCHIVED") return "neutral";
  if (status === "ACTIVE" && (threatLevel === "CRITICAL" || threatLevel === "HIGH")) return "at-risk";
  return "active";
}

function computeFallbackPosition(id: string, index: number, total: number, isAgent = false): [number, number, number] {
  // Deterministic hash from id for stable positions across polls
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  const angle = (hash % 1000) / 1000 * Math.PI * 2;
  const radius = isAgent ? 35 + (index % 3) * 8 : 80 + (index % 5) * 60;
  return [
    Math.round(Math.cos(angle) * radius),
    0,
    Math.round(Math.sin(angle) * radius),
  ];
}

function getPosition(entity: { mapX: number | null; mapY: number | null; mapZ: number | null }, fallback: [number, number, number]): [number, number, number] {
  if (entity.mapX !== null && entity.mapY !== null && entity.mapZ !== null) {
    return [entity.mapX, entity.mapY, entity.mapZ];
  }
  return fallback;
}

export async function GET() {
  try {
    const [goals, agents] = await Promise.all([
      prisma.goal.findMany({
        include: { milestones: { orderBy: { date: "asc" } }, agent: true },
        orderBy: [{ status: "asc" }, { threatLevel: "desc" }, { createdAt: "desc" }],
      }),
      prisma.agent.findMany({ where: { isActive: true } }),
    ]);

    // Build goal nodes
    const goalNodes: GoalMapNode[] = goals.map((goal, idx) => {
      const completed = goal.milestones.filter(m => m.isCompleted).length;
      const total = goal.milestones.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const fallbackPos = computeFallbackPosition(goal.id, idx, goals.length);
      return {
        id: goal.id,
        name: goal.title,
        state: mapNodeState(goal.status, goal.threatLevel),
        progress,
        threatLevel: goal.threatLevel,
        status: goal.status,
        position: getPosition(goal, fallbackPos),
        agentId: goal.agentId,
        milestoneCount: total,
        completedMilestones: completed,
      };
    });

    // Build agent nodes (satellites)
    const agentNodes: AgentMapNode[] = agents.map((agent, idx) => {
      const fallbackPos = computeFallbackPosition(agent.id, idx, agents.length, true);
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        rank: agent.rank,
        avatarIcon: agent.avatarIcon ?? "",
        isActive: agent.isActive,
        position: getPosition(agent, fallbackPos),
      };
    });

    // Connections
    const connections: Connection[] = [];
    // agent-goal tethers
    for (const goal of goals) {
      if (goal.agentId) {
        connections.push({ from: goal.agentId, to: goal.id, type: "agent-goal" });
      }
    }
    // goal-goal nearest-2 by fallback position
    const goalsWithFallback = goals.map((g, i) => ({ goal: g, fallback: computeFallbackPosition(g.id, i, goals.length) }));
    for (const { goal: g1, fallback: f1 } of goalsWithFallback) {
      const sorted = goalsWithFallback
        .filter(({ goal }) => goal.id !== g1.id)
        .sort((a, b) => {
          const d1 = (a.fallback[0] - f1[0]) ** 2 + (a.fallback[2] - f1[2]) ** 2;
          const d2 = (b.fallback[0] - f1[0]) ** 2 + (b.fallback[2] - f1[2]) ** 2;
          return d1 - d2;
        })
        .slice(0, 2);
      for (const { goal: g2 } of sorted) {
        connections.push({ from: g1.id, to: g2.id, type: "goal-goal" });
      }
    }

    // Stats
    const activeGoals = goals.filter(g => g.status === "ACTIVE").length;
    const completedGoals = goals.filter(g => g.status === "COMPLETED").length;
    const criticalGoals = goals.filter(g => g.status === "ACTIVE" && (g.threatLevel === "CRITICAL" || g.threatLevel === "HIGH")).length;
    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => {
          const c = g.milestones.filter(m => m.isCompleted).length;
          const t = g.milestones.length;
          return sum + (t > 0 ? c / t : 0);
        }, 0) / goals.length * 100)
      : 0;

    const stats: WarMapStats = {
      totalGoals: goals.length,
      activeGoals,
      completedGoals,
      criticalGoals,
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.isActive).length,
      averageProgress: avgProgress,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ goals: goalNodes, agents: agentNodes, connections, stats });
  } catch (error) {
    console.error("Failed to fetch warmap:", error);
    return NextResponse.json({ error: "Failed to fetch warmap" }, { status: 500 });
  }
}