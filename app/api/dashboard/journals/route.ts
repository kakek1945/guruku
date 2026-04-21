import { NextResponse } from "next/server";

import { and, desc, eq, gte, lt, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { journals } from "@/lib/db/schema";
import { formatDisplayDate } from "@/lib/server/dashboard-content";
import { getSessionFromRequest } from "@/lib/server/dashboard";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get("fromDate")?.trim() || "";
  const toDate = searchParams.get("toDate")?.trim() || "";
  const month = searchParams.get("month")?.trim() || "";

  const filters = [eq(journals.authUserId, session.user.id)];

  if (month) {
    const [year, monthValue] = month.split("-");
    const startDate = `${year}-${monthValue}-01`;
    const nextMonthDate = new Date(Number(year), Number(monthValue), 1);
    const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

    filters.push(gte(journals.entryDate, startDate));
    filters.push(lt(journals.entryDate, nextMonth));
  } else {
    if (fromDate) {
      filters.push(gte(journals.entryDate, fromDate));
    }

    if (toDate) {
      filters.push(lte(journals.entryDate, toDate));
    }
  }

  const history = await db.query.journals.findMany({
    where: and(...filters),
    orderBy: [desc(journals.entryDate), desc(journals.createdAt)],
    limit: month || fromDate || toDate ? 200 : 12,
  });

  return NextResponse.json({
    history: history.map((entry) => ({
      id: entry.id,
      date: formatDisplayDate(entry.entryDate),
      className: entry.className,
      subject: entry.subject,
      hours: entry.hours,
      topic: entry.topic,
      goal: entry.goal,
      activity: entry.activity,
      note: entry.note || "-",
      status: entry.status,
      entryDate: entry.entryDate,
    })),
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
    note: body.note || null,
    status: body.status === "draft" ? "draft" : "published",
    updatedAt: new Date(),
  });

  const history = await db.query.journals.findMany({
    where: eq(journals.authUserId, session.user.id),
    orderBy: [desc(journals.entryDate), desc(journals.createdAt)],
    limit: 12,
  });

  return NextResponse.json({
    message: body.status === "draft" ? "Draft jurnal berhasil disimpan." : "Jurnal berhasil disimpan.",
    history: history.map((entry) => ({
      id: entry.id,
      date: formatDisplayDate(entry.entryDate),
      className: entry.className,
      subject: entry.subject,
      hours: entry.hours,
      topic: entry.topic,
      goal: entry.goal,
      activity: entry.activity,
      note: entry.note || "-",
      status: entry.status,
      entryDate: entry.entryDate,
    })),
  });
}
