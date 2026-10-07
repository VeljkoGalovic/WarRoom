import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        milestones: {
          orderBy: { date: "asc" },
        },
        agent: true,
      },
      orderBy: [
        { status: "asc" },
        { threatLevel: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, strategy, threatLevel, agentId } = body;

    // For demo purposes, use the first user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        strategy,
        threatLevel: threatLevel || "MEDIUM",
        status: "ACTIVE",
        userId: user.id,
        agentId,
      },
      include: {
        milestones: true,
        agent: true,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Failed to create goal:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}