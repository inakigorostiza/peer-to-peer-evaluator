import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGroupSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { courseId } = await params;

  const groups = await prisma.group.findMany({
    where: { courseId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          memberships: true,
          evaluations: true,
        },
      },
      memberships: {
        select: { userId: true },
      },
    },
  });

  // Calculate evaluation completion for each group
  const groupsWithStats = await Promise.all(
    groups.map(async (group) => {
      const memberCount = group._count.memberships;
      // Total possible evaluations = n * (n-1) where n is member count
      const totalPossible = memberCount * (memberCount - 1);
      const completedEvals = group._count.evaluations;

      return {
        id: group.id,
        externalId: group.externalId,
        name: group.name,
        memberCount,
        completedEvaluations: completedEvals,
        totalPossibleEvaluations: totalPossible,
        completionPercent:
          totalPossible > 0 ? Math.round((completedEvals / totalPossible) * 100) : 0,
      };
    })
  );

  return NextResponse.json(groupsWithStats);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createGroupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, externalId } = parsed.data;
  const finalExternalId = externalId || `manual_${Date.now()}`;

  const group = await prisma.group.create({
    data: {
      name,
      externalId: finalExternalId,
      courseId,
    },
  });

  return NextResponse.json(group, { status: 201 });
}
