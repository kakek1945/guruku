import { NextResponse } from "next/server";

import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { attendanceRegisters, journals, materialsLibrary, mediaLibrary, teacherProfiles, videoLibrary } from "@/lib/db/schema";
import { materials, mediaAssets, teacherProfile, videoAssets } from "@/lib/mock-data";
import { formatDisplayDate, toThumbnailBackground } from "@/lib/server/dashboard-content";

const monthMap: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Agu: 7,
  Sep: 8,
  Okt: 9,
  Nov: 10,
  Des: 11,
};

const defaultAnnouncement = {
  title: teacherProfile.announcementTitle,
  detail: teacherProfile.announcementBody,
  date: "20 Apr 2026",
  teacherName: teacherProfile.name,
};

function parseDateLabel(label: string) {
  const [day, month, year] = label.split(" ");
  return new Date(Number(year), monthMap[month] ?? 0, Number(day));
}

function parseDateInput(label: string) {
  const [year, month, day] = label.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekRange(dateLabel: string) {
  const current = parseDateInput(dateLabel);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(current);
  start.setDate(current.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start,
    end,
    startLabel: toDateInputValue(start),
    endLabel: toDateInputValue(end),
    weekLabel: `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`,
  };
}

function formatAttendanceStatus(status: string) {
  if (status === "S") {
    return "Sakit";
  }

  if (status === "I") {
    return "Izin";
  }

  if (status === "A") {
    return "Alpha";
  }

  return "Hadir";
}

async function getWeeklyJournalRecap(authUserId: string | null | undefined) {
  if (!authUserId) {
    return {
      weekLabel: "Pekan jurnal terbaru",
      totalEntries: 0,
      classCount: 0,
      subjectCount: 0,
      latestItems: [],
    };
  }

  const latestJournal = await db.query.journals.findFirst({
    where: eq(journals.authUserId, authUserId),
    orderBy: [desc(journals.entryDate), desc(journals.createdAt)],
  });

  if (!latestJournal) {
    return {
      weekLabel: "Pekan jurnal terbaru",
      totalEntries: 0,
      classCount: 0,
      subjectCount: 0,
      latestItems: [],
    };
  }

  const range = getWeekRange(latestJournal.entryDate);
  const weeklyJournals = await db.query.journals.findMany({
    where: and(
      eq(journals.authUserId, authUserId),
      gte(journals.entryDate, range.startLabel),
      lte(journals.entryDate, range.endLabel),
    ),
    orderBy: [desc(journals.entryDate), desc(journals.createdAt)],
  });

  return {
    weekLabel: range.weekLabel,
    totalEntries: weeklyJournals.length,
    classCount: new Set(weeklyJournals.map((item) => item.className)).size,
    subjectCount: new Set(weeklyJournals.map((item) => item.subject)).size,
    latestItems: weeklyJournals.slice(0, 3).map((item) => ({
      date: formatDisplayDate(item.entryDate),
      className: item.className,
      subject: item.subject,
      topic: item.topic,
      hours: item.hours,
    })),
  };
}

async function getWeeklyAttendanceRecap(authUserId: string | null | undefined) {
  if (!authUserId) {
    return {
      weekLabel: "Pekan absensi terbaru",
      absentStudents: [],
    };
  }

  const latestAttendance = await db.query.attendanceRegisters.findFirst({
    orderBy: [desc(attendanceRegisters.attendanceDate), desc(attendanceRegisters.updatedAt)],
    where: eq(attendanceRegisters.authUserId, authUserId),
  });

  if (!latestAttendance) {
    return {
      weekLabel: "Pekan absensi terbaru",
      absentStudents: [],
    };
  }

  const range = getWeekRange(latestAttendance.attendanceDate);
  const weeklyRegisters = await db.query.attendanceRegisters.findMany({
    where: and(
      eq(attendanceRegisters.authUserId, authUserId),
      gte(attendanceRegisters.attendanceDate, range.startLabel),
      lte(attendanceRegisters.attendanceDate, range.endLabel),
    ),
    orderBy: [desc(attendanceRegisters.attendanceDate), desc(attendanceRegisters.updatedAt)],
  });

  const absentStudents = weeklyRegisters.flatMap((item) =>
    item.entries
      .filter((entry) => entry.status !== "H")
      .map((entry) => ({
        attendanceDate: formatDisplayDate(item.attendanceDate),
        studentName: entry.name,
        className: item.className,
        description: formatAttendanceStatus(entry.status),
      })),
  );

  return {
    weekLabel: range.weekLabel,
    absentStudents,
  };
}

export async function GET() {
  const [dbMaterials, dbMedia, dbVideos, latestTeacherProfile] = await Promise.all([
    db.query.materialsLibrary.findMany({
      orderBy: [desc(materialsLibrary.updatedAt)],
      limit: 3,
    }),
    db.query.mediaLibrary.findMany({
      orderBy: [desc(mediaLibrary.updatedAt)],
      limit: 3,
    }),
    db.query.videoLibrary.findMany({
      orderBy: [desc(videoLibrary.updatedAt)],
      limit: 3,
    }),
    db.query.teacherProfiles.findFirst({
      orderBy: [desc(teacherProfiles.updatedAt)],
    }),
  ]);

  const [weeklyJournalRecap, weeklyAttendanceRecap] = await Promise.all([
    getWeeklyJournalRecap(latestTeacherProfile?.authUserId),
    getWeeklyAttendanceRecap(latestTeacherProfile?.authUserId),
  ]);

  const latestMaterials = [...materials]
    .sort((a, b) => parseDateLabel(b.updatedAt).getTime() - parseDateLabel(a.updatedAt).getTime())
    .slice(0, 3);

  const latestMedia = [...mediaAssets]
    .sort((a, b) => parseDateLabel(b.uploadedAt).getTime() - parseDateLabel(a.uploadedAt).getTime())
    .slice(0, 3);

  const latestVideos = [...videoAssets]
    .sort((a, b) => parseDateLabel(b.publishedAt).getTime() - parseDateLabel(a.publishedAt).getTime())
    .slice(0, 3);

  return NextResponse.json({
    announcement:
      latestTeacherProfile?.announcementTitle || latestTeacherProfile?.announcementBody
        ? {
            title: latestTeacherProfile.announcementTitle || "Pengumuman guru",
            detail:
              latestTeacherProfile.announcementBody ||
              "Silakan cek materi dan arahan terbaru dari guru melalui GuruKu.",
            date: formatDisplayDate(latestTeacherProfile.updatedAt),
            teacherName: latestTeacherProfile.name,
          }
        : defaultAnnouncement,
    weeklyRecap: {
      journal: weeklyJournalRecap,
      attendance: weeklyAttendanceRecap,
    },
    latestMaterials:
      dbMaterials.length > 0
        ? dbMaterials.map((item) => ({
            title: item.title,
            type: item.type,
            className: item.className,
            updatedAt: formatDisplayDate(item.updatedAt),
            thumbnail: toThumbnailBackground(item.thumbnailPath, "material"),
          }))
        : latestMaterials,
    latestMedia:
      dbMedia.length > 0
        ? dbMedia.map((item) => ({
            title: item.title,
            format: item.format,
            size: item.sizeLabel || "-",
            uploadedAt: formatDisplayDate(item.updatedAt),
            thumbnail: toThumbnailBackground(item.thumbnailPath, "media"),
          }))
        : latestMedia,
    latestVideos:
      dbVideos.length > 0
        ? dbVideos.map((item) => ({
            title: item.title,
            source: item.source,
            className: item.className,
            publishedAt: formatDisplayDate(item.updatedAt),
            thumbnail: toThumbnailBackground(item.thumbnailPath, "video"),
            videoUrl: item.videoUrl,
          }))
        : latestVideos,
  });
}
