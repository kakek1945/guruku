import { NextResponse } from "next/server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { attendanceRegisters, students } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/server/dashboard";

const defaultStatuses = ["H", "S", "I", "A"];

function buildSummary(entries: Array<{ status: string }>) {
  return defaultStatuses.map((status) => ({
    label: status,
    value: entries.filter((entry) => entry.status === status).length,
    description:
      status === "H" ? "Hadir" : status === "S" ? "Sakit" : status === "I" ? "Izin" : "Alpha",
  }));
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const className = searchParams.get("className") || "VII-A";
  const attendanceDate = searchParams.get("attendanceDate") || new Date().toISOString().slice(0, 10);
  const subject = searchParams.get("subject") || "Matematika";
  const meeting = searchParams.get("meeting") || "Pertemuan 1";

  const roster = await db.query.students.findMany({
    where: eq(students.className, className),
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  const registers = await db.query.attendanceRegisters.findMany({
    where: eq(attendanceRegisters.authUserId, session.user.id),
    orderBy: [desc(attendanceRegisters.updatedAt)],
    limit: 20,
  });

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
    entries,
    summary: buildSummary(entries),
    history: registers.slice(0, 8).map((item) => ({
      id: item.id,
      attendanceDate: item.attendanceDate,
      className: item.className,
      subject: item.subject,
      meeting: item.meeting,
      total: item.entries.length,
    })),
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

  return NextResponse.json({
    message: "Absensi berhasil disimpan.",
    summary: buildSummary(body.entries),
  });
}
