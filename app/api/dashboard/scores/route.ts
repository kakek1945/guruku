import { NextResponse } from "next/server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { scoreRegisters, students } from "@/lib/db/schema";
import { formatDisplayDate } from "@/lib/server/dashboard-content";
import { getSessionFromRequest } from "@/lib/server/dashboard";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const className = searchParams.get("className") || "VII-A";
  const scoreDate = searchParams.get("scoreDate") || new Date().toISOString().slice(0, 10);
  const subject = searchParams.get("subject") || "Matematika";
  const scoreType = searchParams.get("scoreType") || "Quiz/Ulangan Harian";
  const meeting = searchParams.get("meeting") || "Pertemuan 1";

  const roster = await db.query.students.findMany({
    where: eq(students.className, className),
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  const allRegisters = await db.query.scoreRegisters.findMany({
    where: eq(scoreRegisters.authUserId, session.user.id),
    orderBy: [desc(scoreRegisters.scoreDate), desc(scoreRegisters.updatedAt)],
    limit: 12,
  });

  const matchedRegister =
    allRegisters.find(
      (item) =>
        item.className === className &&
        item.scoreDate === scoreDate &&
        item.subject === subject &&
        item.scoreType === scoreType &&
        item.meeting === meeting,
    ) || null;

  const entries = roster.map((student) => {
    const existingEntry = matchedRegister?.entries.find((entry) => entry.nis === student.nis);

    return {
      name: student.name,
      nis: student.nis,
      score: existingEntry?.score ?? 0,
      status: existingEntry?.status || "Tuntas",
    };
  });

  return NextResponse.json({
    entries,
    history: allRegisters.map((item) => {
      const average =
        item.entries.length > 0
          ? Math.round(
              item.entries.reduce((total, entry) => total + Number(entry.score || 0), 0) / item.entries.length,
            )
          : 0;

      return {
        id: item.id,
        date: formatDisplayDate(item.scoreDate),
        type: item.scoreType,
        className: item.className,
        topic: item.meeting,
        average,
      };
    }),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    scoreDate: string;
    className: string;
    subject: string;
    scoreType: string;
    meeting: string;
    entries: Array<{ nis: string; name: string; score: number; status: string }>;
  };

  if (!body.scoreDate || !body.className || !body.subject || !body.scoreType || !body.meeting) {
    return NextResponse.json({ message: "Lengkapi tanggal, kelas, mapel, jenis nilai, dan topik." }, { status: 400 });
  }

  await db
    .insert(scoreRegisters)
    .values({
      authUserId: session.user.id,
      scoreDate: body.scoreDate,
      className: body.className,
      subject: body.subject,
      scoreType: body.scoreType,
      meeting: body.meeting,
      entries: body.entries,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        scoreRegisters.authUserId,
        scoreRegisters.scoreDate,
        scoreRegisters.className,
        scoreRegisters.subject,
        scoreRegisters.scoreType,
        scoreRegisters.meeting,
      ],
      set: {
        entries: body.entries,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({
    message: "Nilai berhasil disimpan.",
  });
}
