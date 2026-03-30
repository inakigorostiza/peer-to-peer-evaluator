import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.studentGroupMembership.findFirst({
    where: { userId: session.user.id },
    include: {
      group: {
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
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "No group assigned" }, { status: 404 });
  }

  // Check which members the current user has already evaluated
  const evaluations = await prisma.evaluation.findMany({
    where: {
      evaluatorId: session.user.id,
      groupId: membership.groupId,
    },
    select: { evaluateeId: true, score: true, comment: true },
  });

  const evaluationMap = new Map(
    evaluations.map((e) => [e.evaluateeId, { score: e.score, comment: e.comment }])
  );

  const members = membership.group.memberships
    .map((m) => ({
      ...m.user,
      displayName:
        m.user.firstName && m.user.lastName
          ? `${m.user.firstName} ${m.user.lastName}`
          : m.user.name || m.user.email,
      evaluatedByMe: evaluationMap.has(m.user.id),
      myEvaluation: evaluationMap.get(m.user.id) || null,
      isMe: m.user.id === session.user.id,
    }))
    .filter((m) => !m.isMe);

  return NextResponse.json({
    group: {
      id: membership.group.id,
      name: membership.group.name,
      externalId: membership.group.externalId,
    },
    course: {
      id: membership.group.course.id,
      name: membership.group.course.name,
    },
    members,
  });
}
