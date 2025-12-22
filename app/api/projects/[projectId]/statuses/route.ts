import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getSession();
    const { projectId } = await params;

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, color, unicode } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: "Name and color are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        users: {
          some: {
            id: session.userId,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    const maxOrder = await prisma.status.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const status = await prisma.status.create({
      data: {
        name,
        color,
        unicode: unicode || "📋",
        order: (maxOrder?.order ?? -1) + 1,
        projectId,
      },
    });

    return NextResponse.json({ status }, { status: 201 });
  } catch (error) {
    console.error("Create status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
