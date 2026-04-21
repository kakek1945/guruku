import { NextResponse } from "next/server";

import { count, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { attendanceRegisters, journals, materialsLibrary, scoreRegisters, students } from "@/lib/db/schema";
import {
  classAssignments,
  dashboardMetrics,
  quickActions,
  scheduleToday,
} from "@/lib/mock-data";

export async function GET() {
  const [studentCountRow, journalCountRow, attendanceCountRow, scoreCountRow, latestJournals] = await Promise.all([
    db.select({ total: count() }).from(students),
    db.select({ total: count() }).from(journals),
    db.select({ total: count() }).from(attendanceRegisters),
    db.select({ total: count() }).from(scoreRegisters),
    db.query.journals.findMany({
      orderBy: [desc(journals.updatedAt)],
      limit: 6,
    }),
  ]);

  const dynamicMetrics = [
    {
      label: "Data siswa",
      value: `${Number(studentCountRow[0]?.total ?? 0)} siswa`,
      note: "Jumlah siswa aktif yang tersimpan.",
    },
    {
      label: "Jurnal tersimpan",
      value: `${Number(journalCountRow[0]?.total ?? 0)}`,
      note: "Semua entri jurnal yang berhasil disimpan.",
    },
    {
      label: "Absensi masuk",
      value: `${Number(attendanceCountRow[0]?.total ?? 0)}`,
      note: "Jumlah sesi absensi yang sudah tercatat.",
    },
    {
      label: "Nilai terbaru",
      value: `${Number(scoreCountRow[0]?.total ?? 0)}`,
      note: "Jumlah set nilai yang tersimpan.",
    },
  ];

  const dynamicClasses =
    classAssignments.length > 0
      ? classAssignments.map((item) => {
          const latestJournal = latestJournals.find((entry) => entry.className === item.className);
          return {
            ...item,
            latestTopic: latestJournal?.topic || item.latestTopic,
          };
        })
      : classAssignments;

  return NextResponse.json({
    metrics: journalCountRow[0]?.total || attendanceCountRow[0]?.total || scoreCountRow[0]?.total ? dynamicMetrics : dashboardMetrics,
    quickActions,
    scheduleToday,
    classAssignments: dynamicClasses,
  });
}
