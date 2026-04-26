import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/server/dashboard";
import { createSystemBackup, parseSystemBackup, restoreSystemBackup } from "@/lib/server/system-backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getAdminUserFromRequest(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return {
      error: NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 }),
    };
  }

  const authUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!authUser) {
    return {
      error: NextResponse.json({ message: "Akun pengguna tidak ditemukan." }, { status: 404 }),
    };
  }

  if (authUser.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { message: "Hanya admin yang dapat mengelola backup sistem." },
        { status: 403 },
      ),
    };
  }

  return { authUser };
}

function buildBackupFilename(generatedAt: string) {
  const safeTimestamp = generatedAt.replace(/[:.]/g, "-");
  return `guruku-backup-${safeTimestamp}.json`;
}

export async function GET(request: Request) {
  const adminResult = await getAdminUserFromRequest(request);

  if ("error" in adminResult) {
    return adminResult.error;
  }

  try {
    const payload = await createSystemBackup({
      userId: adminResult.authUser.id,
      email: adminResult.authUser.email,
    });

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${buildBackupFilename(payload.meta.generatedAt)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Backup sistem belum dapat dibuat." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const adminResult = await getAdminUserFromRequest(request);

  if ("error" in adminResult) {
    return adminResult.error;
  }

  const formData = await request.formData();
  const confirmationText = formData.get("confirmationText");
  const backupFile = formData.get("backupFile");

  if (confirmationText !== "RESTORE") {
    return NextResponse.json(
      { message: "Ketik RESTORE untuk mengonfirmasi pemulihan data." },
      { status: 400 },
    );
  }

  if (!(backupFile instanceof File) || backupFile.size === 0) {
    return NextResponse.json(
      { message: "Pilih file backup yang valid terlebih dahulu." },
      { status: 400 },
    );
  }

  try {
    const payload = parseSystemBackup(await backupFile.text());

    if (!payload.database.user.some((backupUser) => backupUser.role === "ADMIN")) {
      return NextResponse.json(
        { message: "Backup harus memiliki minimal satu akun admin." },
        { status: 400 },
      );
    }

    const summary = await restoreSystemBackup(payload);

    return NextResponse.json({
      message: "Restore berhasil. Silakan login ulang untuk melanjutkan.",
      ...summary,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Restore backup gagal dijalankan." },
      { status: 400 },
    );
  }
}
