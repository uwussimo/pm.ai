import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ statusId: string }> }
) {
  try {
    const session = await getSession();
    const { statusId } = await params;

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, color, unicode, order } = await request.json();

    const status = await prisma.status.findUnique({
      where: { id: statusId },
      include: {
        project: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!status) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 });
    }

    const isUserInProject = status.project.users.some(
      (user: { id: string }) => user.id === session.userId
    );

    if (!isUserInProject) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedStatus = await prisma.status.update({
      where: { id: statusId },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(unicode && { unicode }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ status: updatedStatus });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ statusId: string }> }
) {
  try {
    const session = await getSession();
    const { statusId } = await params;

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await prisma.status.findUnique({
      where: { id: statusId },
      include: {
        project: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!status) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 });
    }

    const isUserInProject = status.project.users.some(
      (user: { id: string }) => user.id === session.userId
    );

    if (!isUserInProject) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.status.delete({
      where: { id: statusId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
