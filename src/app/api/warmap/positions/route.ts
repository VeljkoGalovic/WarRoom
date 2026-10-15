import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_XZ = 2000;
const MAX_Y = 50;

function validatePosition(position: unknown): [number, number, number] | null {
  if (!Array.isArray(position) || position.length !== 3) return null;
  const [x, y, z] = position;
  if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") return null;
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  if (Math.abs(x) > MAX_XZ || Math.abs(z) > MAX_XZ || Math.abs(y) > MAX_Y) return null;
  return [x, y, z];
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, type, position } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    if (type !== "goal" && type !== "agent") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const validated = validatePosition(position);
    if (!validated) {
      return NextResponse.json({ error: "Invalid position" }, { status: 400 });
    }

    const [x, y, z] = validated;

    if (type === "goal") {
      const goal = await prisma.goal.findUnique({ where: { id } });
      if (!goal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }
      await prisma.goal.update({
        where: { id },
        data: { mapX: x, mapY: y, mapZ: z },
      });
    } else {
      const agent = await prisma.agent.findUnique({ where: { id } });
      if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }
      await prisma.agent.update({
        where: { id },
        data: { mapX: x, mapY: y, mapZ: z },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update position:", error);
    return NextResponse.json({ error: "Failed to update position" }, { status: 500 });
  }
}