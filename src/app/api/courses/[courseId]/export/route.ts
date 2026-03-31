import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function displayName(user: {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
}) {
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  return user.name || user.email;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return new Response("Course not found", { status: 404 });
  }

  const evaluations = await prisma.evaluation.findMany({
    where: {
      group: { courseId },
    },
    include: {
      group: { select: { name: true } },
      evaluator: {
        select: { email: true, name: true, firstName: true, lastName: true },
      },
      evaluatee: {
        select: { email: true, name: true, firstName: true, lastName: true },
      },
    },
    orderBy: [
      { group: { name: "asc" } },
      { evaluator: { email: "asc" } },
      { evaluatee: { email: "asc" } },
    ],
  });

  const rows = evaluations.map((ev) => ({
    Group: ev.group.name,
    From: displayName(ev.evaluator),
    To: displayName(ev.evaluatee),
    Score: ev.score,
    Comment: ev.comment || "",
    Date: ev.createdAt.toISOString().split("T")[0],
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 15 }, // Group
    { wch: 25 }, // From
    { wch: 25 }, // To
    { wch: 8 },  // Score
    { wch: 50 }, // Comment
    { wch: 12 }, // Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluations");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const safeName = course.name.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "_");

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeName}_evaluations.xlsx"`,
    },
  });
}
