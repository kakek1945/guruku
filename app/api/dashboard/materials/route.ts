import { NextResponse } from "next/server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { materialsLibrary } from "@/lib/db/schema";
import { getSessionFromRequest, savePublicFileUpload, savePublicImageUpload } from "@/lib/server/dashboard";
import { formatDisplayDate, inferMaterialType, toThumbnailBackground } from "@/lib/server/dashboard-content";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const items = await db.query.materialsLibrary.findMany({
    where: eq(materialsLibrary.authUserId, session.user.id),
    orderBy: [desc(materialsLibrary.updatedAt)],
    limit: 12,
  });

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      className: item.className,
      subject: item.subject,
      topic: item.topic,
      meeting: item.meeting,
      updatedAt: formatDisplayDate(item.updatedAt),
      thumbnail: toThumbnailBackground(item.thumbnailPath, "material"),
      documentPath: item.documentPath,
      externalLink: item.externalLink,
      description: item.description || "",
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const className = String(formData.get("className") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const topic = String(formData.get("topic") || "").trim();
  const meeting = String(formData.get("meeting") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const externalLink = String(formData.get("externalLink") || "").trim();
  const status = String(formData.get("status") || "published").trim();

  if (!title || !className || !subject || !topic || !meeting) {
    return NextResponse.json({ message: "Lengkapi judul, kelas, mapel, topik, dan pertemuan." }, { status: 400 });
  }

  let documentPath: string | null = null;
  let thumbnailPath: string | null = null;

  const documentFile = formData.get("documentFile");
  if (documentFile instanceof File && documentFile.size > 0) {
    documentPath = await savePublicFileUpload(documentFile, session.user.id, "materials");
  }

  const thumbnailFile = formData.get("thumbnailFile");
  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    thumbnailPath = await savePublicImageUpload(thumbnailFile, session.user.id, "material-thumbnails");
  } else {
    const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim();
    thumbnailPath = thumbnailUrl || null;
  }

  const type = inferMaterialType(documentFile instanceof File ? documentFile.name : null, externalLink);

  await db.insert(materialsLibrary).values({
    authUserId: session.user.id,
    title,
    className,
    subject,
    topic,
    meeting,
    description: description || null,
    documentPath,
    externalLink: externalLink || null,
    thumbnailPath,
    type,
    status: status === "draft" ? "draft" : "published",
    updatedAt: new Date(),
  });

  return NextResponse.json({
    message: status === "draft" ? "Draft materi berhasil disimpan." : "Materi berhasil disimpan.",
  });
}
