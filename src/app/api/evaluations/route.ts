import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluationSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";

async function validateEvaluation(session: { user: { id: string } }, evaluateeId: string, groupId: string) {
  if (evaluateeId === session.user.id) {
    return { error: "You cannot evaluate yourself", status: 400 };
  }

  const [evaluatorMembership, evaluateeMembership] = await Promise.all([
    prisma.studentGroupMembership.findUnique({
      where: { userId_groupId: { userId: session.user.id, groupId } },
    }),
    prisma.studentGroupMembership.findUnique({
      where: { userId_groupId: { userId: evaluateeId, groupId } },
    }),
  ]);

  if (!evaluatorMembership) {
    return { error: "You are not a member of this group", status: 400 };
  }
  if (!evaluateeMembership) {
    return { error: "The evaluatee is not a member of this group", status: 400 };
  }
  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = evaluationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { evaluateeId, groupId, score, comment } = parsed.data;

  const validationError = await validateEvaluation(session, evaluateeId, groupId);
  if (validationError) {
    return NextResponse.json({ error: validationError.error }, { status: validationError.status });
  }

  const existing = await prisma.evaluation.findUnique({
    where: {
      evaluatorId_evaluateeId_groupId: {
        evaluatorId: session.user.id,
        evaluateeId,
        groupId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already evaluated this peer" },
      { status: 409 }
    );
  }

  try {
    const evaluation = await prisma.evaluation.create({
      data: {
        evaluatorId: session.user.id,
        evaluateeId,
        groupId,
        score,
        comment: comment || null,
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already evaluated this peer" },
        { status: 409 }
      );
    }
    throw error;
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = evaluationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { evaluateeId, groupId, score, comment } = parsed.data;

  const validationError = await validateEvaluation(session, evaluateeId, groupId);
  if (validationError) {
    return NextResponse.json({ error: validationError.error }, { status: validationError.status });
  }

  const existing = await prisma.evaluation.findUnique({
    where: {
      evaluatorId_evaluateeId_groupId: {
        evaluatorId: session.user.id,
        evaluateeId,
        groupId,
      },
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "No existing evaluation found to update" },
      { status: 404 }
    );
  }

  const evaluation = await prisma.evaluation.update({
    where: { id: existing.id },
    data: {
      score,
      comment: comment || null,
    },
  });

  return NextResponse.json(evaluation);
}
