import { NextResponse } from "next/server";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  attendanceRegisters,
  classesCatalog,
  journals,
  materialsLibrary,
  scoreRegisters,
  students,
  teacherProfiles,
  videoLibrary,
} from "@/lib/db/schema";
import { academicFilters } from "@/lib/mock-data";
import { getSessionFromRequest } from "@/lib/server/dashboard";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const selectedClass = searchParams.get("className") || "VII-A";
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const subjectFilter = searchParams.get("subject") || "Matematika";
  const schoolYear = searchParams.get("schoolYear") || academicFilters.schoolYear;
  const semester = searchParams.get("semester") || academicFilters.semester;

  const allStudents = await db.query.students.findMany({
    orderBy: (table, { asc }) => [asc(table.className), asc(table.name)],
  });
  const classCatalogItems = await db.query.classesCatalog.findMany({
    where: and(
      eq(classesCatalog.authUserId, session.user.id),
      eq(classesCatalog.schoolYear, schoolYear),
      eq(classesCatalog.semester, semester),
    ),
    orderBy: (table, { asc }) => [asc(table.className)],
  });

  const latestJournals = await db.query.journals.findMany({
    where: eq(journals.authUserId, session.user.id),
    orderBy: [desc(journals.entryDate), desc(journals.updatedAt)],
    limit: 24,
  });

  const teacherProfile = await db.query.teacherProfiles.findFirst({
    where: eq(teacherProfiles.authUserId, session.user.id),
  });

  const classNames = Array.from(
    new Set([
      ...classCatalogItems.map((item) => item.className),
      ...allStudents.map((student) => student.className),
    ]),
  ).sort();
  const activeClassName =
    classNames.includes(selectedClass) ? selectedClass : classNames[0] || "";

  const roster = allStudents
    .filter((student) => student.className === activeClassName)
    .filter((student) =>
      search ? `${student.name} ${student.nis}`.toLowerCase().includes(search) : true,
    );

  const classAssignments = classNames.map((className) => {
    const classStudents = allStudents.filter((student) => student.className === className);
    const latestJournal = latestJournals.find((entry) => entry.className === className);

    return {
      className,
      subject: subjectFilter || teacherProfile?.role || "Mata pelajaran",
      students: classStudents.length,
      journalProgress: latestJournal ? "Sudah diisi" : "Belum ada jurnal",
      latestTopic: latestJournal?.topic || "Belum ada topik",
    };
  });

  return NextResponse.json({
    filters: {
      schoolYear,
      semester,
    },
    activeClassName,
    classOptions: classNames,
    classAssignments,
    roster: roster.map((student) => ({
      name: student.name,
      nis: student.nis,
      className: student.className,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    className: string;
    schoolYear: string;
    semester: string;
  };

  const className = body.className?.trim();
  const schoolYear = body.schoolYear?.trim() || academicFilters.schoolYear;
  const semester = body.semester?.trim() || academicFilters.semester;

  if (!className) {
    return NextResponse.json({ message: "Nama kelas wajib diisi." }, { status: 400 });
  }

  await db
    .insert(classesCatalog)
    .values({
      authUserId: session.user.id,
      className,
      schoolYear,
      semester,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        classesCatalog.authUserId,
        classesCatalog.className,
        classesCatalog.schoolYear,
        classesCatalog.semester,
      ],
      set: {
        updatedAt: new Date(),
      },
    });

  const classCatalogItems = await db.query.classesCatalog.findMany({
    where: and(
      eq(classesCatalog.authUserId, session.user.id),
      eq(classesCatalog.schoolYear, schoolYear),
      eq(classesCatalog.semester, semester),
    ),
    orderBy: (table, { asc }) => [asc(table.className)],
  });

  return NextResponse.json({
    message: `Kelas ${className} berhasil disimpan.`,
    classOptions: classCatalogItems.map((item) => item.className),
  });
}

export async function DELETE(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    className: string;
    schoolYear?: string;
    semester?: string;
  };

  const className = body.className?.trim();
  const schoolYear = body.schoolYear?.trim() || academicFilters.schoolYear;
  const semester = body.semester?.trim() || academicFilters.semester;

  if (!className) {
    return NextResponse.json({ message: "Pilih kelas yang ingin dihapus." }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(classesCatalog)
      .where(
        and(
          eq(classesCatalog.authUserId, session.user.id),
          eq(classesCatalog.className, className),
          eq(classesCatalog.schoolYear, schoolYear),
          eq(classesCatalog.semester, semester),
        ),
      );

    await tx.delete(students).where(eq(students.className, className));
    await tx
      .delete(journals)
      .where(and(eq(journals.authUserId, session.user.id), eq(journals.className, className)));
    await tx
      .delete(attendanceRegisters)
      .where(
        and(
          eq(attendanceRegisters.authUserId, session.user.id),
          eq(attendanceRegisters.className, className),
        ),
      );
    await tx
      .delete(scoreRegisters)
      .where(and(eq(scoreRegisters.authUserId, session.user.id), eq(scoreRegisters.className, className)));
    await tx
      .delete(materialsLibrary)
      .where(
        and(eq(materialsLibrary.authUserId, session.user.id), eq(materialsLibrary.className, className)),
      );
    await tx
      .delete(videoLibrary)
      .where(and(eq(videoLibrary.authUserId, session.user.id), eq(videoLibrary.className, className)));
  });

  const remainingStudents = await db.query.students.findMany({
    orderBy: (table, { asc }) => [asc(table.className), asc(table.name)],
  });
  const classCatalogItems = await db.query.classesCatalog.findMany({
    where: and(
      eq(classesCatalog.authUserId, session.user.id),
      eq(classesCatalog.schoolYear, schoolYear),
      eq(classesCatalog.semester, semester),
    ),
    orderBy: (table, { asc }) => [asc(table.className)],
  });

  const classOptions = Array.from(
    new Set([
      ...classCatalogItems.map((item) => item.className),
      ...remainingStudents.map((student) => student.className),
    ]),
  ).sort();

  return NextResponse.json({
    message: `Kelas ${className} berhasil dihapus.`,
    classOptions,
  });
}
