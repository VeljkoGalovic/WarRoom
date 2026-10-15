import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activityLog: { findMany: vi.fn() },
  },
}));

describe("GET /api/activity-logs", () => {
  it("returns latest 50 activity logs", async () => {
    const mockLogs = [
      { id: "l1", timestamp: new Date("2026-10-15T10:00:00Z"), category: "PHYSICAL", message: "Morning run", metadata: null, userId: "u1", agentId: null },
      { id: "l2", timestamp: new Date("2026-10-15T09:00:00Z"), category: "SYSTEMS", message: "Deploy done", metadata: { buildId: "b1" }, userId: "u1", agentId: "a1" },
    ];
    prisma.activityLog.findMany.mockResolvedValue(mockLogs);

    const res = await GET(new NextRequest(new URL("http://localhost:3001/api/activity-logs")));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.logs).toHaveLength(2);
    expect(json.logs[0].id).toBe("l1");
    expect(json.logs[0].category).toBe("PHYSICAL");
    expect(json.logs[1].metadata).toEqual({ buildId: "b1" });
  });
});