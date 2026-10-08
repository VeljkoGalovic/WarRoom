import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, rank, role, systemPrompt, modelEndpoint, avatarIcon, identity, operationalPrompt, isActive } = body;

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        name,
        rank,
        role,
        systemPrompt,
        modelEndpoint,
        avatarIcon,
        identity,
        operationalPrompt,
        isActive,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Failed to update agent:", error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.agent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete agent:", error);
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
  }
}