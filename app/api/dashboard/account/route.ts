import { NextResponse } from "next/server";

import { and, eq, ne } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { displayAuthLogin, normalizeAuthLogin } from "@/lib/auth-login";
import { db } from "@/lib/db";
import { teacherProfiles, user } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/server/dashboard";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    username?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const username = body.username?.trim().toLowerCase() || "";
  const currentPassword = body.currentPassword?.trim() || "";
  const newPassword = body.newPassword?.trim() || "";
  const normalizedRequestedUsername = username ? normalizeAuthLogin(username) : "";

  if (!username && !newPassword) {
    return NextResponse.json(
      { message: "Isi username login baru atau password baru terlebih dahulu." },
      { status: 400 },
    );
  }

  if (username) {
    const existingUser = await db.query.user.findFirst({
      where: and(eq(user.email, normalizedRequestedUsername), ne(user.id, session.user.id)),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username/login tersebut sudah digunakan akun lain." },
        { status: 400 },
      );
    }

    await db
      .update(user)
      .set({
        email: normalizedRequestedUsername,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    await db
      .update(teacherProfiles)
      .set({
        email: username,
        updatedAt: new Date(),
      })
      .where(eq(teacherProfiles.authUserId, session.user.id));
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { message: "Password saat ini wajib diisi untuk mengganti password." },
        { status: 400 },
      );
    }

    try {
      await auth.api.changePassword({
        headers: request.headers,
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Password belum dapat diperbarui.";

      return NextResponse.json({ message }, { status: 400 });
    }
  }

  const updatedUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  return NextResponse.json({
    message: "Username/login dan password berhasil diperbarui.",
    username: displayAuthLogin(updatedUser?.email || normalizedRequestedUsername),
  });
}
