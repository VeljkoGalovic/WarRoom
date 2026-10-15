import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    goal: { findMany: vi.fn() },
    agent: { findMany: vi.fn() },
  },
}));

describe("GET /api/warmap", () => {
  it("returns WarMapPayload with goals, agents, connections, stats", async () => {
    const mockGoals = [
      {
        id: "g1",
        title: "GOAL ONE",
        description: null,
        strategy: null,
        status: "ACTIVE",
        threatLevel: "CRITICAL",
        userId: "u1",
        milestones: [{ id: "m1", isCompleted: true }, { id: "m2", isCompleted: false }],
        agent: {
          id: "a1",
          name: "AGENT ONE",
          role: "TACTICAL",
          rank: "CAPTAIN",
          identity: null,
          operationalPrompt: null,
          systemPrompt: "",
          modelEndpoint: "",
          avatarIcon: null,
          isActive: true,
          userId: "u1",
          mapX: null,
          mapY: null,
          mapZ: null,
        },
        agentId: "a1",
        mapX: 100,
        mapY: 0,
        mapZ: -50,
      },
    ];
    const mockAgents = [
      {
        id: "a1",
        name: "AGENT ONE",
        role: "TACTICAL",
        rank: "CAPTAIN",
        identity: null,
        operationalPrompt: null,
        systemPrompt: "",
        modelEndpoint: "",
        avatarIcon: null,
        isActive: true,
        userId: "u1",
        mapX: 120,
        mapY: 5,
        mapZ: -45,
        goals: [],
      },
    ];
    prisma.goal.findMany.mockResolvedValue(mockGoals);
    prisma.agent.findMany.mockResolvedValue(mockAgents);

    const req = new NextRequest(new URL("http://localhost:3001/api/warmap"));
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.goals).toHaveLength(1);
    expect(json.goals[0].state).toBe("at-risk"); // ACTIVE + CRITICAL
    expect(json.goals[0].progress).toBe(50); // 1/2 completed
    expect(json.goals[0].position).toEqual([100, 0, -50]);
    expect(json.agents).toHaveLength(1);
    expect(json.connections.some((c: any) => c.from === "a1" && c.to === "g1")).toBe(true);
    expect(json.stats.totalGoals).toBe(1);
    expect(json.stats.activeAgents).toBe(1);
  });

  it("maps COMPLETED status to conquered state", async () => {
    prisma.goal.findMany.mockResolvedValue([
      {
        id: "g2",
        title: "DONE",
        description: null,
        strategy: null,
        status: "COMPLETED",
        threatLevel: "LOW",
        userId: "u1",
        milestones: [{ id: "m3", isCompleted: true }],
        agent: null,
        mapX: null,
        mapY: null,
        mapZ: null,
      },
    ]);
    prisma.agent.findMany.mockResolvedValue([]);

    const res = await GET(new NextRequest(new URL("http://localhost:3001/api/warmap")));
    const json = await res.json();
    expect(json.goals[0].state).toBe("conquered");
  });
});