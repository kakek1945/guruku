import { NextResponse } from "next/server";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { attendanceRegisters, students, teacherProfiles } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/server/dashboard";
import { resolveTeacherSubject } from "@/lib/teacher-subjects";

const defaultStatuses = ["H", "S", "I", "A"];

function buildSummary(entries: Array<{ status: string }>) {
  return defaultStatuses.map((status) => ({
    label: status,
    value: entries.filter((entry) => entry.status === status).length,
    description:
      status === "H" ? "Hadir" : status === "S" ? "Sakit" : status === "I" ? "Izin" : "Alpha",
  }));
}

function mapAttendanceHistoryItem(item: typeof attendanceRegisters.$inferSelect) {
  return {
    id: item.id,
    attendanceDate: item.attendanceDate,
    className: item.className,
    subject: item.subject,
    meeting: item.meeting,
    total: item.entries.length,
  };
}

async function getAttendanceHistory(authUserId: string) {
  const registers = await db.query.attendanceRegisters.findMany({
    where: eq(attendanceRegisters.authUserId, authUserId),
    orderBy: [desc(attendanceRegisters.updatedAt)],
    limit: 20,
  });

  return registers;
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const className = searchParams.get("className") || "VII-A";
  const attendanceDate = searchParams.get("attendanceDate") || new Date().toISOString().slice(0, 10);
  const meeting = searchParams.get("meeting") || "Pertemuan 1";
  const teacherProfile = await db.query.teacherProfiles.findFirst({
    where: eq(teacherProfiles.authUserId, session.user.id),
  });
  const subject = resolveTeacherSubject(searchParams.get("subject"), teacherProfile?.role);

  const roster = await db.query.students.findMany({
    where: eq(students.className, className),
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  const registers = await getAttendanceHistory(session.user.id);

  const matchedRegister =
    registers.find(
      (item) =>
        item.className === className &&
        item.attendanceDate === attendanceDate &&
        item.subject === subject &&
        item.meeting === meeting,
    ) || null;

  const entries = roster.map((student) => {
    const existingEntry = matchedRegister?.entries.find((entry) => entry.nis === student.nis);

    return {
      name: student.name,
      nis: student.nis,
      status: existingEntry?.status || "H",
      note: existingEntry?.note || "Default hadir",
    };
  });

  return NextResponse.json({
    activeRecordId: matchedRegister?.id || null,
    entries,
    summary: buildSummary(entries),
    history: registers.slice(0, 8).map(mapAttendanceHistoryItem),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    attendanceDate: string;
    className: string;
    subject: string;
    meeting: string;
    entries: Array<{ nis: string; name: string; status: string; note?: string }>;
  };

  if (!body.attendanceDate || !body.className || !body.subject || !body.meeting) {
    return NextResponse.json({ message: "Lengkapi tanggal, kelas, mapel, dan pertemuan." }, { status: 400 });
  }

  await db
    .insert(attendanceRegisters)
    .values({
      authUserId: session.user.id,
      attendanceDate: body.attendanceDate,
      className: body.className,
      subject: body.subject,
      meeting: body.meeting,
      entries: body.entries,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        attendanceRegisters.authUserId,
        attendanceRegisters.attendanceDate,
        attendanceRegisters.className,
        attendanceRegisters.subject,
        attendanceRegisters.meeting,
      ],
      set: {
        entries: body.entries,
        updatedAt: new Date(),
      },
    });

  const registers = await getAttendanceHistory(session.user.id);
  const activeRecord =
    registers.find(
      (item) =>
        item.className === body.className &&
        item.attendanceDate === body.attendanceDate &&
        item.subject === body.subject &&
        item.meeting === body.meeting,
    ) || null;

  return NextResponse.json({
    message: "Absensi berhasil disimpan.",
    summary: buildSummary(body.entries),
    history: registers.slice(0, 8).map(mapAttendanceHistoryItem),
    activeRecordId: activeRecord?.id || null,
  });
}

export async function PUT(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: string;
    attendanceDate: string;
    className: string;
    subject: string;
    meeting: string;
    entries: Array<{ nis: string; name: string; status: string; note?: string }>;
  };

  if (!body.id || !body.attendanceDate || !body.className || !body.subject || !body.meeting) {
    return NextResponse.json({ message: "Lengkapi tanggal, kelas, mapel, dan pertemuan." }, { status: 400 });
  }

  const updatedRows = await db
    .update(attendanceRegisters)
    .set({
      attendanceDate: body.attendanceDate,
      className: body.className,
      subject: body.subject,
      meeting: body.meeting,
      entries: body.entries,
      updatedAt: new Date(),
    })
    .where(and(eq(attendanceRegisters.id, body.id), eq(attendanceRegisters.authUserId, session.user.id)))
    .returning({ id: attendanceRegisters.id });

  if (updatedRows.length === 0) {
    return NextResponse.json({ message: "Absensi yang ingin diperbarui tidak ditemukan." }, { status: 404 });
  }

  const registers = await getAttendanceHistory(session.user.id);

  return NextResponse.json({
    message: "Absensi berhasil diperbarui.",
    summary: buildSummary(body.entries),
    history: registers.slice(0, 8).map(mapAttendanceHistoryItem),
    activeRecordId: body.id,
  });
}

export async function DELETE(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as { id: string };

  if (!body.id) {
    return NextResponse.json({ message: "Pilih absensi yang ingin dihapus." }, { status: 400 });
  }

  const deletedRows = await db
    .delete(attendanceRegisters)
    .where(and(eq(attendanceRegisters.id, body.id), eq(attendanceRegisters.authUserId, session.user.id)))
    .returning({ id: attendanceRegisters.id });

  if (deletedRows.length === 0) {
    return NextResponse.json({ message: "Absensi yang ingin dihapus tidak ditemukan." }, { status: 404 });
  }

  const registers = await getAttendanceHistory(session.user.id);

  return NextResponse.json({
    message: "Absensi berhasil dihapus.",
    history: registers.slice(0, 8).map(mapAttendanceHistoryItem),
  });
}
