import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { InferSelectModel } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  account,
  attendanceRegisters,
  classesCatalog,
  journals,
  materialsLibrary,
  mediaLibrary,
  scoreRegisters,
  session,
  students,
  teacherProfiles,
  user,
  verification,
  videoLibrary,
} from "@/lib/db/schema";

const BACKUP_FORMAT = "guruku-system-backup";
const BACKUP_VERSION = 1;
const PUBLIC_UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

type DatabaseSnapshot = {
  user: Array<InferSelectModel<typeof user>>;
  session: Array<InferSelectModel<typeof session>>;
  account: Array<InferSelectModel<typeof account>>;
  verification: Array<InferSelectModel<typeof verification>>;
  teacherProfiles: Array<InferSelectModel<typeof teacherProfiles>>;
  students: Array<InferSelectModel<typeof students>>;
  classesCatalog: Array<InferSelectModel<typeof classesCatalog>>;
  journals: Array<InferSelectModel<typeof journals>>;
  attendanceRegisters: Array<InferSelectModel<typeof attendanceRegisters>>;
  scoreRegisters: Array<InferSelectModel<typeof scoreRegisters>>;
  materialsLibrary: Array<InferSelectModel<typeof materialsLibrary>>;
  mediaLibrary: Array<InferSelectModel<typeof mediaLibrary>>;
  videoLibrary: Array<InferSelectModel<typeof videoLibrary>>;
};

export type SystemBackupPayload = {
  meta: {
    format: typeof BACKUP_FORMAT;
    version: typeof BACKUP_VERSION;
    generatedAt: string;
    generatedByUserId: string;
    generatedByEmail: string;
    includesUploads: boolean;
  };
  database: DatabaseSnapshot;
  uploads: Array<{
    path: string;
    base64: string;
  }>;
};

export type SystemRestoreSummary = {
  restoredAt: string;
  backupGeneratedAt: string;
  uploadCount: number;
  restoredCounts: Record<string, number>;
};

type BackupCandidate = Partial<SystemBackupPayload> & {
  meta?: Partial<SystemBackupPayload["meta"]>;
  database?: Partial<Record<keyof DatabaseSnapshot, unknown>>;
  uploads?: Array<{ path?: unknown; base64?: unknown }>;
};

async function listUploadFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await listUploadFiles(absolutePath)));
      continue;
    }

    if (entry.isFile()) {
      results.push(absolutePath);
    }
  }

  return results;
}

function toUploadBackupPath(absolutePath: string) {
  const relativePath = path.relative(PUBLIC_UPLOADS_ROOT, absolutePath);
  const normalized = relativePath.split(path.sep).join("/");

  return `/uploads/${normalized}`;
}

function toSafeUploadRelativePath(uploadPath: string) {
  const normalized = uploadPath.replace(/\\/g, "/");

  if (!normalized.startsWith("/uploads/")) {
    throw new Error(`Path upload tidak valid: ${uploadPath}`);
  }

  const segments = normalized.split("/").filter(Boolean);

  if (segments[0] !== "uploads" || segments.slice(1).some((segment) => segment === "..")) {
    throw new Error(`Path upload tidak aman: ${uploadPath}`);
  }

  return path.join(...segments.slice(1));
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function toDateOrNull(value: string | Date | null) {
  if (!value) {
    return null;
  }

  return toDate(value);
}

function normalizeDatabaseSnapshot(snapshot: BackupCandidate["database"]): DatabaseSnapshot {
  if (!snapshot) {
    throw new Error("Backup tidak memiliki data database.");
  }

  const requiredKeys: Array<keyof DatabaseSnapshot> = [
    "user",
    "session",
    "account",
    "verification",
    "teacherProfiles",
    "students",
    "classesCatalog",
    "journals",
    "attendanceRegisters",
    "scoreRegisters",
    "materialsLibrary",
    "mediaLibrary",
    "videoLibrary",
  ];

  for (const key of requiredKeys) {
    if (!Array.isArray(snapshot[key])) {
      throw new Error(`Bagian backup '${key}' tidak valid.`);
    }
  }

  return {
    user: snapshot.user.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    session: snapshot.session.map((row: any) => ({
      ...row,
      expiresAt: toDate(row.expiresAt),
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    account: snapshot.account.map((row: any) => ({
      ...row,
      accessTokenExpiresAt: toDateOrNull(row.accessTokenExpiresAt),
      refreshTokenExpiresAt: toDateOrNull(row.refreshTokenExpiresAt),
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    verification: snapshot.verification.map((row: any) => ({
      ...row,
      expiresAt: toDate(row.expiresAt),
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    teacherProfiles: snapshot.teacherProfiles.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    students: snapshot.students.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    classesCatalog: snapshot.classesCatalog.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    journals: snapshot.journals.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    attendanceRegisters: snapshot.attendanceRegisters.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    scoreRegisters: snapshot.scoreRegisters.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    materialsLibrary: snapshot.materialsLibrary.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    mediaLibrary: snapshot.mediaLibrary.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
    videoLibrary: snapshot.videoLibrary.map((row: any) => ({
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    })),
  };
}

function normalizeUploads(uploads: BackupCandidate["uploads"]) {
  if (!Array.isArray(uploads)) {
    throw new Error("Bagian upload pada backup tidak valid.");
  }

  return uploads.map((file) => {
    if (typeof file?.path !== "string" || typeof file?.base64 !== "string") {
      throw new Error("File upload pada backup tidak valid.");
    }

    return {
      path: file.path,
      base64: file.base64,
    };
  });
}

async function readUploadsSnapshot() {
  try {
    const absoluteFiles = await listUploadFiles(PUBLIC_UPLOADS_ROOT);

    return Promise.all(
      absoluteFiles.map(async (absolutePath) => ({
        path: toUploadBackupPath(absolutePath),
        base64: (await readFile(absolutePath)).toString("base64"),
      })),
    );
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function readDatabaseSnapshot(): Promise<DatabaseSnapshot> {
  const [
    users,
    sessions,
    accounts,
    verifications,
    teacherProfilesRows,
    studentsRows,
    classesRows,
    journalsRows,
    attendanceRows,
    scoreRows,
    materialsRows,
    mediaRows,
    videosRows,
  ] = await Promise.all([
    db.select().from(user),
    db.select().from(session),
    db.select().from(account),
    db.select().from(verification),
    db.select().from(teacherProfiles),
    db.select().from(students),
    db.select().from(classesCatalog),
    db.select().from(journals),
    db.select().from(attendanceRegisters),
    db.select().from(scoreRegisters),
    db.select().from(materialsLibrary),
    db.select().from(mediaLibrary),
    db.select().from(videoLibrary),
  ]);

  return {
    user: users,
    session: sessions,
    account: accounts,
    verification: verifications,
    teacherProfiles: teacherProfilesRows,
    students: studentsRows,
    classesCatalog: classesRows,
    journals: journalsRows,
    attendanceRegisters: attendanceRows,
    scoreRegisters: scoreRows,
    materialsLibrary: materialsRows,
    mediaLibrary: mediaRows,
    videoLibrary: videosRows,
  };
}

export async function createSystemBackup(params: { userId: string; email: string }) {
  const [databaseSnapshot, uploadsSnapshot] = await Promise.all([
    readDatabaseSnapshot(),
    readUploadsSnapshot(),
  ]);

  const payload: SystemBackupPayload = {
    meta: {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      generatedAt: new Date().toISOString(),
      generatedByUserId: params.userId,
      generatedByEmail: params.email,
      includesUploads: true,
    },
    database: databaseSnapshot,
    uploads: uploadsSnapshot,
  };

  return payload;
}

async function insertRowsInChunks(tx: any, table: any, rows: any[], chunkSize = 200) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);

    if (chunk.length > 0) {
      await tx.insert(table).values(chunk);
    }
  }
}

async function restoreUploads(files: SystemBackupPayload["uploads"]) {
  await rm(PUBLIC_UPLOADS_ROOT, { recursive: true, force: true });
  await mkdir(PUBLIC_UPLOADS_ROOT, { recursive: true });

  for (const file of files) {
    const relativePath = toSafeUploadRelativePath(file.path);
    const targetPath = path.join(PUBLIC_UPLOADS_ROOT, relativePath);
    const targetDirectory = path.dirname(targetPath);

    await mkdir(targetDirectory, { recursive: true });
    await writeFile(targetPath, Buffer.from(file.base64, "base64"));
  }
}

export function parseSystemBackup(input: string) {
  let parsed: BackupCandidate;

  try {
    parsed = JSON.parse(input) as BackupCandidate;
  } catch {
    throw new Error("File backup tidak dapat dibaca sebagai JSON.");
  }

  if (parsed?.meta?.format !== BACKUP_FORMAT) {
    throw new Error("Format backup tidak dikenali.");
  }

  if (parsed?.meta?.version !== BACKUP_VERSION) {
    throw new Error("Versi backup tidak didukung.");
  }

  return {
    meta: {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      generatedAt: typeof parsed.meta.generatedAt === "string" ? parsed.meta.generatedAt : "",
      generatedByUserId: typeof parsed.meta.generatedByUserId === "string" ? parsed.meta.generatedByUserId : "",
      generatedByEmail: typeof parsed.meta.generatedByEmail === "string" ? parsed.meta.generatedByEmail : "",
      includesUploads: parsed.meta.includesUploads !== false,
    },
    database: normalizeDatabaseSnapshot(parsed.database),
    uploads: normalizeUploads(parsed.uploads ?? []),
  } satisfies SystemBackupPayload;
}

export async function restoreSystemBackup(payload: SystemBackupPayload): Promise<SystemRestoreSummary> {
  await db.transaction(async (tx) => {
    await tx.delete(attendanceRegisters);
    await tx.delete(scoreRegisters);
    await tx.delete(journals);
    await tx.delete(materialsLibrary);
    await tx.delete(mediaLibrary);
    await tx.delete(videoLibrary);
    await tx.delete(classesCatalog);
    await tx.delete(students);
    await tx.delete(teacherProfiles);
    await tx.delete(session);
    await tx.delete(account);
    await tx.delete(verification);
    await tx.delete(user);

    await insertRowsInChunks(tx, user, payload.database.user);
    await insertRowsInChunks(tx, verification, payload.database.verification);
    await insertRowsInChunks(tx, session, payload.database.session);
    await insertRowsInChunks(tx, account, payload.database.account);
    await insertRowsInChunks(tx, teacherProfiles, payload.database.teacherProfiles);
    await insertRowsInChunks(tx, students, payload.database.students);
    await insertRowsInChunks(tx, classesCatalog, payload.database.classesCatalog);
    await insertRowsInChunks(tx, journals, payload.database.journals);
    await insertRowsInChunks(tx, attendanceRegisters, payload.database.attendanceRegisters);
    await insertRowsInChunks(tx, scoreRegisters, payload.database.scoreRegisters);
    await insertRowsInChunks(tx, materialsLibrary, payload.database.materialsLibrary);
    await insertRowsInChunks(tx, mediaLibrary, payload.database.mediaLibrary);
    await insertRowsInChunks(tx, videoLibrary, payload.database.videoLibrary);
  });

  await restoreUploads(payload.uploads);

  return {
    restoredAt: new Date().toISOString(),
    backupGeneratedAt: payload.meta.generatedAt,
    uploadCount: payload.uploads.length,
    restoredCounts: {
      user: payload.database.user.length,
      session: payload.database.session.length,
      account: payload.database.account.length,
      verification: payload.database.verification.length,
      teacherProfiles: payload.database.teacherProfiles.length,
      students: payload.database.students.length,
      classesCatalog: payload.database.classesCatalog.length,
      journals: payload.database.journals.length,
      attendanceRegisters: payload.database.attendanceRegisters.length,
      scoreRegisters: payload.database.scoreRegisters.length,
      materialsLibrary: payload.database.materialsLibrary.length,
      mediaLibrary: payload.database.mediaLibrary.length,
      videoLibrary: payload.database.videoLibrary.length,
    },
  };
}
