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
import { getTeacherSubjects, resolveTeacherSubject } from "@/lib/teacher-subjects";

function buildClassOptions(
  classCatalogItems: Array<{ className: string }>,
  allStudents: Array<{ className: string }>,
) {
  return Array.from(
    new Set([
      ...classCatalogItems.map((item) => item.className),
      ...allStudents.map((student) => student.className),
    ]),
  ).sort();
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const selectedClass = searchParams.get("className") || "VII-A";
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const requestedSubject = searchParams.get("subject") || "";
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
  const subjectOptions = getTeacherSubjects(teacherProfile?.role);
  const activeSubject = resolveTeacherSubject(requestedSubject, teacherProfile?.role);

  const classNames = buildClassOptions(classCatalogItems, allStudents);
  const activeClassName =
    classNames.includes(selectedClass) ? selectedClass : classNames[0] || "";

  const roster = allStudents
    .filter((student) => student.className === activeClassName)
    .filter((student) =>
      search ? `${student.name} ${student.nis}`.toLowerCase().includes(search) : true,
    );

  const classAssignments = classNames.map((className) => {
    const classStudents = allStudents.filter((student) => student.className === className);
    const latestJournal =
      latestJournals.find((entry) => entry.className === className && entry.subject === activeSubject) ||
      latestJournals.find((entry) => entry.className === className);

    return {
      className,
      subject: latestJournal?.subject || activeSubject,
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
    activeSubject,
    classOptions: classNames,
    subjectOptions,
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

export async function PUT(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    currentClassName: string;
    newClassName: string;
    schoolYear?: string;
    semester?: string;
  };

  const currentClassName = body.currentClassName?.trim();
  const newClassName = body.newClassName?.trim();
  const schoolYear = body.schoolYear?.trim() || academicFilters.schoolYear;
  const semester = body.semester?.trim() || academicFilters.semester;

  if (!currentClassName || !newClassName) {
    return NextResponse.json({ message: "Nama kelas lama dan baru wajib diisi." }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    if (currentClassName !== newClassName) {
      await tx
        .delete(classesCatalog)
        .where(
          and(
            eq(classesCatalog.authUserId, session.user.id),
            eq(classesCatalog.className, currentClassName),
            eq(classesCatalog.schoolYear, schoolYear),
            eq(classesCatalog.semester, semester),
          ),
        );

      await tx
        .insert(classesCatalog)
        .values({
          authUserId: session.user.id,
          className: newClassName,
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

      await tx
        .update(students)
        .set({
          className: newClassName,
          updatedAt: new Date(),
        })
        .where(eq(students.className, currentClassName));
      await tx
        .update(journals)
        .set({
          className: newClassName,
          updatedAt: new Date(),
        })
        .where(and(eq(journals.authUserId, session.user.id), eq(journals.className, currentClassName)));
      await tx
        .update(attendanceRegisters)
        .set({
          className: newClassName,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(attendanceRegisters.authUserId, session.user.id),
            eq(attendanceRegisters.className, currentClassName),
          ),
        );
      await tx
        .update(scoreRegisters)
        .set({
          className: newClassName,
          updatedAt: new Date(),
        })
        .where(
          and(eq(scoreRegisters.authUserId, session.user.id), eq(scoreRegisters.className, currentClassName)),
        );
      await tx
        .update(materialsLibrary)
        .set({
          className: newClassName,
          updatedAt: new Date(),
        })
        .where(
          and(eq(materialsLibrary.authUserId, session.user.id), eq(materialsLibrary.className, currentClassName)),
        );
      await tx
        .update(videoLibrary)
        .set({
          className: newClassName,
          updatedAt: new Date(),
        })
        .where(and(eq(videoLibrary.authUserId, session.user.id), eq(videoLibrary.className, currentClassName)));
    }
  });

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

  return NextResponse.json({
    message:
      currentClassName === newClassName
        ? `Kelas ${newClassName} berhasil diperbarui.`
        : `Kelas ${currentClassName} berhasil diubah menjadi ${newClassName}.`,
    classOptions: buildClassOptions(classCatalogItems, allStudents),
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

  const classOptions = buildClassOptions(classCatalogItems, remainingStudents);

  return NextResponse.json({
    message: `Kelas ${className} berhasil dihapus.`,
    classOptions,
  });
}
