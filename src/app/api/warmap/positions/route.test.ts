import { PATCH } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    goal: { findUnique: vi.fn(), update: vi.fn() },
    agent: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

describe("PATCH /api/warmap/positions", () => {
  it("updates goal position and returns ok", async () => {
    prisma.goal.findUnique.mockResolvedValue({ id: "g1" });
    prisma.goal.update.mockResolvedValue({ id: "g1", mapX: 100, mapY: 0, mapZ: -50 });

    const body = { id: "g1", type: "goal", position: [100, 0, -50] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(prisma.goal.update).toHaveBeenCalledWith({
      where: { id: "g1" },
      data: { mapX: 100, mapY: 0, mapZ: -50 },
    });
  });

  it("updates agent position and returns ok", async () => {
    prisma.agent.findUnique.mockResolvedValue({ id: "a1" });
    prisma.agent.update.mockResolvedValue({ id: "a1", mapX: 120, mapY: 5, mapZ: -45 });

    const body = { id: "a1", type: "agent", position: [120, 5, -45] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(prisma.agent.update).toHaveBeenCalledWith({
      where: { id: "a1" },
      data: { mapX: 120, mapY: 5, mapZ: -45 },
    });
  });

  it("rejects invalid coordinates (out of bounds x)", async () => {
    prisma.goal.findUnique.mockResolvedValue({ id: "g1" });

    const body = { id: "g1", type: "goal", position: [5000, 0, 0] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(400);
  });

  it("rejects invalid coordinates (out of bounds z)", async () => {
    prisma.goal.findUnique.mockResolvedValue({ id: "g1" });

    const body = { id: "g1", type: "goal", position: [0, 0, 5000] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(400);
  });

  it("rejects invalid coordinates (out of bounds y)", async () => {
    prisma.goal.findUnique.mockResolvedValue({ id: "g1" });

    const body = { id: "g1", type: "goal", position: [0, 100, 0] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent goal id", async () => {
    prisma.goal.findUnique.mockResolvedValue(null);

    const body = { id: "ghost", type: "goal", position: [0, 0, 0] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(404);
  });

  it("returns 404 for non-existent agent id", async () => {
    prisma.agent.findUnique.mockResolvedValue(null);

    const body = { id: "ghost", type: "agent", position: [0, 0, 0] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(404);
  });

  it("rejects invalid type", async () => {
    const body = { id: "g1", type: "invalid", position: [0, 0, 0] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(400);
  });

  it("rejects non-finite coordinates", async () => {
    prisma.goal.findUnique.mockResolvedValue({ id: "g1" });

    const body = { id: "g1", type: "goal", position: [NaN, 0, 0] };
    const req = new NextRequest(new URL("http://localhost:3001/api/warmap/positions"), { method: "PATCH", body: JSON.stringify(body) });
    const res = await PATCH(req);

    expect(res.status).toBe(400);
  });
});