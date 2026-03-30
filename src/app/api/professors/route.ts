import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorizedProfessorSchema } from "@/lib/validators";
import { sendProfessorWelcomeEmail } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const professors = await prisma.authorizedProfessor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      addedBy: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(professors);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = authorizedProfessorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const existing = await prisma.authorizedProfessor.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This email is already authorized" },
      { status: 409 }
    );
  }

  const professor = await prisma.authorizedProfessor.create({
    data: {
      email: parsed.data.email,
      addedById: session.user.id,
    },
  });

  // If this user already exists, update their role to PROFESSOR
  await prisma.user.updateMany({
    where: { email: parsed.data.email, role: "STUDENT" },
    data: { role: "PROFESSOR" },
  });

  // Send welcome email (fire-and-forget)
  sendProfessorWelcomeEmail(parsed.data.email);

  return NextResponse.json(professor, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = authorizedProfessorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  await prisma.authorizedProfessor.deleteMany({
    where: { email: parsed.data.email },
  });

  return NextResponse.json({ success: true });
}
