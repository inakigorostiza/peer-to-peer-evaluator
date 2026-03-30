import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      course: true,
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const members = group.memberships.map((m) => ({
    ...m.user,
    displayName:
      m.user.firstName && m.user.lastName
        ? `${m.user.firstName} ${m.user.lastName}`
        : m.user.name || m.user.email,
  }));

  return NextResponse.json({
    id: group.id,
    name: group.name,
    externalId: group.externalId,
    course: group.course,
    members,
  });
}
