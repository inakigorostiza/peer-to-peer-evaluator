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

  const evaluations = await prisma.evaluation.findMany({
    where: { groupId },
    include: {
      evaluator: {
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
        },
      },
      evaluatee: {
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ evaluator: { email: "asc" } }, { evaluatee: { email: "asc" } }],
  });

  const formatted = evaluations.map((e) => ({
    id: e.id,
    score: e.score,
    comment: e.comment,
    createdAt: e.createdAt,
    evaluator: {
      id: e.evaluator.id,
      displayName:
        e.evaluator.firstName && e.evaluator.lastName
          ? `${e.evaluator.firstName} ${e.evaluator.lastName}`
          : e.evaluator.name || e.evaluator.email,
    },
    evaluatee: {
      id: e.evaluatee.id,
      displayName:
        e.evaluatee.firstName && e.evaluatee.lastName
          ? `${e.evaluatee.firstName} ${e.evaluatee.lastName}`
          : e.evaluatee.name || e.evaluatee.email,
    },
  }));

  return NextResponse.json(formatted);
}
