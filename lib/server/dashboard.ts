import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teacherProfiles, user } from "@/lib/db/schema";
import { teacherProfile as defaultTeacherProfile } from "@/lib/mock-data";

const PUBLIC_UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>;

export async function getSessionFromRequest(request: Request): Promise<SessionResult> {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function ensureTeacherProfile(authUserId: string) {
  const existingProfile = await db.query.teacherProfiles.findFirst({
    where: eq(teacherProfiles.authUserId, authUserId),
  });

  if (existingProfile) {
    if (existingProfile.school === "SMP Negeri 4 Bandung") {
      const [updatedProfile] = await db
        .update(teacherProfiles)
        .set({
          school: defaultTeacherProfile.school,
          updatedAt: new Date(),
        })
        .where(eq(teacherProfiles.authUserId, authUserId))
        .returning();

      return updatedProfile;
    }

    return existingProfile;
  }

  const authUser = await db.query.user.findFirst({
    where: eq(user.id, authUserId),
  });

  if (!authUser) {
    throw new Error("Pengguna guru tidak ditemukan.");
  }

  const [createdProfile] = await db
    .insert(teacherProfiles)
    .values({
      authUserId,
      name: authUser.name || defaultTeacherProfile.name,
      role: defaultTeacherProfile.role,
      school: defaultTeacherProfile.school,
      nip: defaultTeacherProfile.nip,
      email: authUser.email || defaultTeacherProfile.email,
      phone: defaultTeacherProfile.phone,
      address: defaultTeacherProfile.address,
      profileImage: authUser.image || null,
      logoImage: null,
      announcementTitle: defaultTeacherProfile.announcementTitle,
      announcementBody: defaultTeacherProfile.announcementBody,
      updatedAt: new Date(),
    })
    .returning();

  return createdProfile;
}

function normalizeImageExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg" || extension === ".png" || extension === ".webp") {
    return extension;
  }

  return ".png";
}

export async function savePublicImageUpload(
  file: File,
  authUserId: string,
  folderName: string,
) {
  const extension = normalizeImageExtension(file.name);
  const uploadDir = path.join(PUBLIC_UPLOADS_ROOT, folderName);
  const uniqueName = `${authUserId}-${Date.now()}${extension}`;
  const targetPath = path.join(uploadDir, uniqueName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(targetPath, fileBuffer);

  return `/uploads/${folderName}/${uniqueName}`;
}

export async function savePublicFileUpload(
  file: File,
  authUserId: string,
  folderName: string,
) {
  const extension = path.extname(file.name).toLowerCase() || ".bin";
  const uploadDir = path.join(PUBLIC_UPLOADS_ROOT, folderName);
  const uniqueName = `${authUserId}-${Date.now()}${extension}`;
  const targetPath = path.join(uploadDir, uniqueName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(targetPath, fileBuffer);

  return `/uploads/${folderName}/${uniqueName}`;
}

export async function removeManagedUpload(uploadPath: string | null | undefined) {
  if (!uploadPath || !uploadPath.startsWith("/uploads/")) {
    return;
  }

  const relativeUploadPath = uploadPath.replace(/^\/uploads\//, "");
  const absolutePath = path.join(PUBLIC_UPLOADS_ROOT, relativeUploadPath);

  if (!absolutePath.startsWith(PUBLIC_UPLOADS_ROOT)) {
    return;
  }

  try {
    await unlink(absolutePath);
  } catch {
    // Old uploads are best-effort cleanup only.
  }
}

export async function buildAbsoluteUploadPath(uploadPath: string | null | undefined) {
  if (!uploadPath || !uploadPath.startsWith("/uploads/")) {
    return null;
  }

  const relativeUploadPath = uploadPath.replace(/^\/uploads\//, "");
  const absolutePath = path.join(PUBLIC_UPLOADS_ROOT, relativeUploadPath);

  if (!absolutePath.startsWith(PUBLIC_UPLOADS_ROOT)) {
    return null;
  }

  return absolutePath;
}

export async function fileExists(uploadPath: string | null | undefined) {
  const absolutePath = await buildAbsoluteUploadPath(uploadPath);

  if (!absolutePath) {
    return false;
  }

  try {
    await readFile(absolutePath);
    return true;
  } catch {
    return false;
  }
}
