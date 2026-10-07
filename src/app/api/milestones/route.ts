import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goalId, title, date, notes } = body;

    if (!goalId || !title) {
      return NextResponse.json({ error: "goalId and title are required" }, { status: 400 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        goalId,
        title,
        date: date ? new Date(date) : new Date(),
        notes,
        isCompleted: false,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Failed to create milestone:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}