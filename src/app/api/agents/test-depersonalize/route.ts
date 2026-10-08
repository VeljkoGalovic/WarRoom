import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveAgentProviderConfig } from "@/lib/providers";
import { depersonalizeForChannel, OutputChannel } from "@/lib/depersonalize";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, text, channel = "external" } = body;

    if (!text || !agentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validChannels: OutputChannel[] = ["internal", "telegram", "external"];
    if (!validChannels.includes(channel)) {
      return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const providerConfig = resolveAgentProviderConfig(agent);

    const result = await depersonalizeForChannel(text, channel, providerConfig);

    return NextResponse.json({
      original: text,
      depersonalized: result,
      channel,
    });
  } catch (error) {
    console.error("Depersonalize test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}