import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStudentsFile } from "@/lib/excel";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const courseId = formData.get("courseId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!courseId) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  // Verify course exists
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data, errors: parseErrors } = parseStudentsFile(buffer);

  if (parseErrors.length > 0) {
    return NextResponse.json({ errors: parseErrors }, { status: 400 });
  }

  if (data.length === 0) {
    return NextResponse.json({ error: "No valid rows found in file" }, { status: 400 });
  }

  // Cross-validate group codes against existing groups in this course
  const existingGroups = await prisma.group.findMany({
    where: { courseId },
    select: { id: true, externalId: true },
  });

  const groupMap = new Map(existingGroups.map((g) => [g.externalId, g.id]));

  const crossErrors = data
    .map((row, i) => {
      if (!groupMap.has(row["Group Code"])) {
        return {
          row: i + 2,
          message: `Group Code "${row["Group Code"]}" does not exist in this course. Import groups first.`,
        };
      }
      return null;
    })
    .filter(Boolean);

  if (crossErrors.length > 0) {
    return NextResponse.json({ errors: crossErrors }, { status: 400 });
  }

  // Import students one by one (no long transaction to avoid Neon timeout)
  let studentsCreated = 0;
  let studentsUpdated = 0;
  let membershipsCreated = 0;

  for (const row of data) {
    const email = row["User Name"].toLowerCase().trim();
    const groupId = groupMap.get(row["Group Code"])!;

    // Upsert user
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.firstName || !user.lastName) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: row["First Name"],
            lastName: row["Last Name"],
          },
        });
      }
      studentsUpdated++;
    } else {
      user = await prisma.user.create({
        data: {
          email,
          firstName: row["First Name"],
          lastName: row["Last Name"],
          name: `${row["First Name"]} ${row["Last Name"]}`,
          role: Role.STUDENT,
        },
      });
      studentsCreated++;
    }

    // Upsert group membership
    const existingMembership = await prisma.studentGroupMembership.findUnique({
      where: { userId_groupId: { userId: user.id, groupId } },
    });

    if (!existingMembership) {
      await prisma.studentGroupMembership.create({
        data: { userId: user.id, groupId },
      });
      membershipsCreated++;
    }
  }

  return NextResponse.json({
    message: `Imported ${studentsCreated} new student(s), updated ${studentsUpdated}, and created ${membershipsCreated} group membership(s).`,
    studentsCreated,
    studentsUpdated,
    membershipsCreated,
  });
}
