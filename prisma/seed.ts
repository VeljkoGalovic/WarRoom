import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a demo user
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@warroom.app" },
    update: {},
    create: {
      email: "demo@warroom.app",
      name: "Demo User",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Created user:", user.email);

  // Create a workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      description: "A demo workspace for testing",
      members: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
      settings: {
        create: {
          theme: "system",
          notifications: true,
          language: "en",
          timezone: "UTC",
        },
      },
    },
  });

  console.log("✅ Created workspace:", workspace.name);

  // Create some resources
  const resources = [
    {
      name: "Getting Started Guide",
      description: "Learn how to use WarRoom effectively",
      type: "document",
      data: { content: "Welcome to WarRoom! This is a sample document." },
    },
    {
      name: "Project Alpha",
      description: "Main project for Q4",
      type: "project",
      data: { status: "active", progress: 45 },
    },
    {
      name: "Team Meeting Notes",
      description: "Notes from weekly team sync",
      type: "note",
      data: { tags: ["meeting", "team", "weekly"] },
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({
      data: {
        ...resource,
        workspaceId: workspace.id,
      },
    });
  }

  console.log("✅ Created resources");

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: user.id,
        workspaceId: workspace.id,
        action: "created",
        entity: "workspace",
        entityId: workspace.id,
        metadata: { name: workspace.name },
      },
      {
        userId: user.id,
        workspaceId: workspace.id,
        action: "created",
        entity: "resource",
        entityId: "getting-started",
        metadata: { name: "Getting Started Guide" },
      },
      {
        userId: user.id,
        workspaceId: workspace.id,
        action: "updated",
        entity: "settings",
        entityId: workspace.id,
        metadata: { theme: "system" },
      },
    ],
  });

  console.log("✅ Created activity logs");
  console.log("🎉 Database seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });