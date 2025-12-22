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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.userId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    const userToInvite = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToInvite) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        users: {
          connect: { id: userToInvite.id },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Invite user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
