import { NextResponse } from "next/server";

import { and, desc, eq, gte, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import { journals } from "@/lib/db/schema";
import { formatDisplayDate } from "@/lib/server/dashboard-content";
import { getSessionFromRequest } from "@/lib/server/dashboard";

function mapJournalHistoryItem(entry: typeof journals.$inferSelect) {
  return {
    id: entry.id,
    date: formatDisplayDate(entry.entryDate),
    className: entry.className,
    subject: entry.subject,
    hours: entry.hours,
    topic: entry.topic,
    goal: entry.goal,
    activity: entry.activity,
    studentTask: entry.studentTask || "-",
    note: entry.note || "-",
    status: entry.status,
    entryDate: entry.entryDate,
  };
}

async function getLatestJournalHistory(authUserId: string) {
  const history = await db.query.journals.findMany({
    where: eq(journals.authUserId, authUserId),
    orderBy: [desc(journals.entryDate), desc(journals.createdAt)],
    limit: 12,
  });

  return history.map(mapJournalHistoryItem);
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month")?.trim() || "";
  const schoolYear = searchParams.get("schoolYear")?.trim() || "";
  const semester = searchParams.get("semester")?.trim() || "";

  const filters = [eq(journals.authUserId, session.user.id)];

  if (month) {
    const [year, monthValue] = month.split("-");
    const startDate = `${year}-${monthValue}-01`;
    const nextMonthDate = new Date(Number(year), Number(monthValue), 1);
    const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

    filters.push(gte(journals.entryDate, startDate));
    filters.push(lt(journals.entryDate, nextMonth));
  } else if (schoolYear && semester) {
    const [startYear, endYear] = schoolYear.split("/");

    if (semester === "Ganjil") {
      filters.push(gte(journals.entryDate, `${startYear}-07-01`));
      filters.push(lt(journals.entryDate, `${Number(startYear) + 1}-01-01`));
    } else {
      filters.push(gte(journals.entryDate, `${endYear}-01-01`));
      filters.push(lt(journals.entryDate, `${endYear}-07-01`));
    }
  }

  const history = await db.query.journals.findMany({
    where: and(...filters),
    orderBy: [desc(journals.entryDate), desc(journals.createdAt)],
    limit: month || (schoolYear && semester) ? 200 : 12,
  });

  return NextResponse.json({
    history: history.map(mapJournalHistoryItem),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    entryDate: string;
    hours: string;
    className: string;
    subject: string;
    topic: string;
    goal: string;
    activity: string;
    studentTask?: string;
    note?: string;
    status?: string;
  };

  if (!body.entryDate || !body.hours || !body.className || !body.subject || !body.topic) {
    return NextResponse.json({ message: "Lengkapi tanggal, jam, kelas, mapel, dan materi." }, { status: 400 });
  }

  await db.insert(journals).values({
    authUserId: session.user.id,
    entryDate: body.entryDate,
    hours: body.hours,
    className: body.className,
    subject: body.subject,
    topic: body.topic,
    goal: body.goal || "-",
    activity: body.activity || "-",
    studentTask: body.studentTask || null,
    note: body.note || null,
    status: body.status === "draft" ? "draft" : "published",
    updatedAt: new Date(),
  });

  return NextResponse.json({
    message: body.status === "draft" ? "Draft jurnal berhasil disimpan." : "Jurnal berhasil disimpan.",
    history: await getLatestJournalHistory(session.user.id),
  });
}

export async function PUT(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: string;
    entryDate: string;
    hours: string;
    className: string;
    subject: string;
    topic: string;
    goal: string;
    activity: string;
    studentTask?: string;
    note?: string;
    status?: string;
  };

  if (!body.id || !body.entryDate || !body.hours || !body.className || !body.subject || !body.topic) {
    return NextResponse.json({ message: "Lengkapi tanggal, jam, kelas, mapel, dan materi." }, { status: 400 });
  }

  const updatedRows = await db
    .update(journals)
    .set({
      entryDate: body.entryDate,
      hours: body.hours,
      className: body.className,
      subject: body.subject,
      topic: body.topic,
      goal: body.goal || "-",
      activity: body.activity || "-",
      studentTask: body.studentTask || null,
      note: body.note || null,
      status: body.status === "draft" ? "draft" : "published",
      updatedAt: new Date(),
    })
    .where(and(eq(journals.id, body.id), eq(journals.authUserId, session.user.id)))
    .returning({ id: journals.id });

  if (updatedRows.length === 0) {
    return NextResponse.json({ message: "Jurnal yang ingin diperbarui tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Jurnal berhasil diperbarui.",
    history: await getLatestJournalHistory(session.user.id),
  });
}

export async function DELETE(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as { id: string };

  if (!body.id) {
    return NextResponse.json({ message: "Pilih jurnal yang ingin dihapus." }, { status: 400 });
  }

  const deletedRows = await db
    .delete(journals)
    .where(and(eq(journals.id, body.id), eq(journals.authUserId, session.user.id)))
    .returning({ id: journals.id });

  if (deletedRows.length === 0) {
    return NextResponse.json({ message: "Jurnal yang ingin dihapus tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Jurnal berhasil dihapus.",
    history: await getLatestJournalHistory(session.user.id),
  });
}
