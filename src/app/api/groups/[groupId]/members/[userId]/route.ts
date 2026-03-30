import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { groupId, userId } = await params;

  const membership = await prisma.studentGroupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Student is not a member of this group" },
      { status: 404 }
    );
  }

  await prisma.studentGroupMembership.delete({
    where: { id: membership.id },
  });

  return NextResponse.json({ message: "Student removed from group" });
}
