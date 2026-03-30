import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      _count: { select: { groups: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const studentCount = await prisma.studentGroupMembership.count({
    where: { group: { courseId } },
  });

  return NextResponse.json({ ...course, studentCount });
}
