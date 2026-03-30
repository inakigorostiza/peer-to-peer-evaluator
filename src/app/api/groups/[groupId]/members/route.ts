import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addStudentSchema } from "@/lib/validators";
import { Role } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { groupId } = await params;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = addStudentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, firstName, lastName } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: Role.STUDENT,
      },
    });
  }

  // Check if membership already exists
  const existing = await prisma.studentGroupMembership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Student is already a member of this group" },
      { status: 409 }
    );
  }

  const membership = await prisma.studentGroupMembership.create({
    data: { userId: user.id, groupId },
  });

  return NextResponse.json(
    {
      id: membership.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
      },
    },
    { status: 201 }
  );
}
