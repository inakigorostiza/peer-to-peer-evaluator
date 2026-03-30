import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validators";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { groups: true } },
    },
  });

  return NextResponse.json(courses);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = courseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const course = await prisma.course.create({
    data: { name: parsed.data.name },
  });

  return NextResponse.json(course, { status: 201 });
}
