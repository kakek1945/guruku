import { NextResponse } from "next/server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { mediaLibrary, videoLibrary } from "@/lib/db/schema";
import { getSessionFromRequest, savePublicFileUpload, savePublicImageUpload } from "@/lib/server/dashboard";
import {
  formatDisplayDate,
  formatFileSize,
  normalizeYouTubeSource,
  toThumbnailBackground,
} from "@/lib/server/dashboard-content";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const [mediaItems, videoItems] = await Promise.all([
    db.query.mediaLibrary.findMany({
      where: eq(mediaLibrary.authUserId, session.user.id),
      orderBy: [desc(mediaLibrary.updatedAt)],
      limit: 12,
    }),
    db.query.videoLibrary.findMany({
      where: eq(videoLibrary.authUserId, session.user.id),
      orderBy: [desc(videoLibrary.updatedAt)],
      limit: 12,
    }),
  ]);

  return NextResponse.json({
    mediaItems: mediaItems.map((item) => ({
      id: item.id,
      title: item.title,
      format: item.format,
      size: item.sizeLabel || "-",
      linkedTo: item.linkedTo || "Belum ditautkan",
      uploadedAt: formatDisplayDate(item.updatedAt),
      thumbnail: toThumbnailBackground(item.thumbnailPath, "media"),
      filePath: item.filePath,
    })),
    videoItems: videoItems.map((item) => ({
      id: item.id,
      title: item.title,
      source: item.source,
      className: item.className,
      topic: item.topic,
      linkedTo: item.linkedTo || "Belum ditautkan",
      publishedAt: formatDisplayDate(item.updatedAt),
      videoUrl: item.videoUrl,
      thumbnail: toThumbnailBackground(item.thumbnailPath, "video"),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const formData = await request.formData();
  const kind = String(formData.get("kind") || "").trim();

  if (kind === "media") {
    const title = String(formData.get("title") || "").trim();
    const format = String(formData.get("format") || "").trim();
    const linkedTo = String(formData.get("linkedTo") || "").trim();
    let filePath: string | null = null;
    let sizeLabel: string | null = null;
    let thumbnailPath: string | null = null;

    const mediaFile = formData.get("mediaFile");
    if (mediaFile instanceof File && mediaFile.size > 0) {
      filePath = await savePublicFileUpload(mediaFile, session.user.id, "media");
      sizeLabel = formatFileSize(mediaFile.size);
    }

    const thumbnailFile = formData.get("thumbnailFile");
    if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
      thumbnailPath = await savePublicImageUpload(thumbnailFile, session.user.id, "media-thumbnails");
    } else {
      const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim();
      thumbnailPath = thumbnailUrl || null;
    }

    if (!title || !format) {
      return NextResponse.json({ message: "Lengkapi nama media dan format." }, { status: 400 });
    }

    await db.insert(mediaLibrary).values({
      authUserId: session.user.id,
      title,
      format,
      linkedTo: linkedTo || null,
      filePath,
      thumbnailPath,
      sizeLabel,
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "Media berhasil disimpan." });
  }

  if (kind === "video") {
    const title = String(formData.get("title") || "").trim();
    const className = String(formData.get("className") || "").trim();
    const topic = String(formData.get("topic") || "").trim();
    const videoUrl = String(formData.get("videoUrl") || "").trim();
    const source = normalizeYouTubeSource(String(formData.get("source") || "").trim());
    const linkedTo = String(formData.get("linkedTo") || "").trim();

    let thumbnailPath: string | null = null;
    const thumbnailFile = formData.get("thumbnailFile");
    if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
      thumbnailPath = await savePublicImageUpload(thumbnailFile, session.user.id, "video-thumbnails");
    } else {
      const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim();
      thumbnailPath = thumbnailUrl || null;
    }

    if (!title || !className || !topic || !videoUrl) {
      return NextResponse.json({ message: "Lengkapi judul, kelas, topik, dan link video." }, { status: 400 });
    }

    await db.insert(videoLibrary).values({
      authUserId: session.user.id,
      title,
      className,
      topic,
      source,
      videoUrl,
      thumbnailPath,
      linkedTo: linkedTo || null,
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "Video berhasil disimpan." });
  }

  return NextResponse.json({ message: "Jenis konten tidak dikenali." }, { status: 400 });
}
