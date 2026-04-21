import { NextResponse } from "next/server";

import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { materialsLibrary, mediaLibrary, teacherProfiles, videoLibrary } from "@/lib/db/schema";
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
