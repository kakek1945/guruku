import { NextResponse } from "next/server";
import { db, pool } from "@/lib/db";
import { auth } from "@/lib/auth";
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
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Run Direct SQL Migration
    await pool.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'SISWA' NOT NULL;`);
    await pool.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false NOT NULL;`);
    await pool.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "auth_user_id" text;`);

    // 2. Clear Database
    await db.delete(attendanceRegisters);
    await db.delete(scoreRegisters);
    await db.delete(journals);
    await db.delete(materialsLibrary);
    await db.delete(mediaLibrary);
    await db.delete(videoLibrary);
    await db.delete(classesCatalog);
    await db.delete(students);
    await db.delete(teacherProfiles);
    await db.delete(session);
    await db.delete(account);
    await db.delete(verification);
    await db.delete(user);

    // 3. Seed Accounts
    const accounts = [
      { name: "Admin Sistem", email: "admin@guruku.local", password: "password123", role: "ADMIN", isVerified: true },
      { name: "Kepala Sekolah", email: "kepsek@guruku.local", password: "password123", role: "KEPALA_SEKOLAH", isVerified: true },
      { name: "Guru Pengajar", email: "guru@guruku.local", password: "password123", role: "GURU", isVerified: true },
      { name: "Siswa Teladan", email: "siswa@guruku.local", password: "password123", role: "SISWA", isVerified: true },
    ];

    const results = [];

    for (const seedData of accounts) {
      // Create user using Better Auth API
      // @ts-ignore
      await auth.api.signUpEmail({
        body: {
          name: seedData.name,
          email: seedData.email,
          password: seedData.password,
          role: seedData.role,
          isVerified: seedData.isVerified,
        },
      });

      const createdUser = await db.query.user.findFirst({
        where: eq(user.email, seedData.email),
      });

      if (createdUser) {
        // Enforce the custom fields just in case
        await db.update(user).set({
          role: seedData.role,
          isVerified: seedData.isVerified,
        }).where(eq(user.id, createdUser.id));

        results.push(seedData.email);

        if (seedData.role === "GURU") {
          await db.insert(teacherProfiles).values({
            authUserId: createdUser.id,
            name: createdUser.name,
            role: "Guru Matematika",
            school: "SMP Negeri 1 Merbau",
            email: createdUser.email,
            announcementTitle: "Pengumuman Guru",
            announcementBody: "Belum ada pengumuman.",
          });
        } else if (seedData.role === "SISWA") {
          await db.insert(students).values({
            authUserId: createdUser.id,
            nis: "12345678",
            name: createdUser.name,
            className: "8A",
            gender: "L",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database migrated and seeded successfully!",
      seededAccounts: results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Migration or Seed failed.",
      error: error.message
    });
  }
}
