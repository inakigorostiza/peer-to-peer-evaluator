import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseGroupsFile } from "@/lib/excel";

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
  const { data, errors } = parseGroupsFile(buffer);

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  if (data.length === 0) {
    return NextResponse.json({ error: "No valid rows found in file" }, { status: 400 });
  }

  // Upsert groups one by one (avoid long transaction timeout on serverless DBs)
  let created = 0;
  let updated = 0;

  for (const row of data) {
    const existing = await prisma.group.findUnique({
      where: { courseId_externalId: { courseId, externalId: row["Group Code"] } },
    });

    if (existing) {
      await prisma.group.update({
        where: { id: existing.id },
        data: { name: row.Title },
      });
      updated++;
    } else {
      await prisma.group.create({
        data: {
          externalId: row["Group Code"],
          name: row.Title,
          courseId,
        },
      });
      created++;
    }
  }

  return NextResponse.json({
    message: `Successfully imported ${created} new group(s) and updated ${updated} existing group(s).`,
    created,
    updated,
  });
}
