import { config } from "dotenv";

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db, pool } from "@/lib/db";
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

config({ path: ".env.local" });
config();

const adminSeed = { name: "Admin Sistem", email: "admin@guruku.local", password: "password123", role: "ADMIN", isVerified: true };
const kepsekSeed = { name: "Kepala Sekolah", email: "kepsek@guruku.local", password: "password123", role: "KEPALA_SEKOLAH", isVerified: true };
const guruSeed = { name: "Guru Pengajar", email: "guru@guruku.local", password: "password123", role: "GURU", isVerified: true };
const siswaSeed = { name: "Siswa Teladan", email: "siswa@guruku.local", password: "password123", role: "SISWA", isVerified: true };

async function resetStoredData() {
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
}

async function createUser(seedData: any) {
  // @ts-ignore
  const response = await auth.api.signUpEmail({
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

  if (!createdUser) {
    throw new Error(`Failed to create ${seedData.role} user.`);
  }

  // Fallback update just in case better-auth didn't save the custom fields
  await db.update(user).set({
    role: seedData.role as "ADMIN" | "KEPALA_SEKOLAH" | "GURU" | "SISWA",
    isVerified: seedData.isVerified,
  }).where(eq(user.id, createdUser.id));

  return createdUser;
}

async function ensureSeedUsers() {
  const adminUser = await createUser(adminSeed);
  const kepsekUser = await createUser(kepsekSeed);
  const guruUser = await createUser(guruSeed);
  const siswaUser = await createUser(siswaSeed);

  // Setup teacher profile for Guru
  await db.insert(teacherProfiles).values({
    authUserId: guruUser.id,
    name: guruUser.name,
    role: "Guru Matematika",
    school: "SMP Negeri 1 Merbau",
    email: guruUser.email,
    announcementTitle: "Pengumuman Guru",
    announcementBody: "Belum ada pengumuman.",
  });

  // Setup student profile for Siswa
  await db.insert(students).values({
    authUserId: siswaUser.id,
    nis: "12345678",
    name: siswaUser.name,
    className: "8A",
    gender: "L",
  });
}

async function main() {
  await resetStoredData();
  await ensureSeedUsers();

  console.log("Database reset and seeded successfully.");
  console.log("Use the following accounts to test (Password for all: password123):");
  console.log("- admin@guruku.local");
  console.log("- kepsek@guruku.local");
  console.log("- guru@guruku.local");
  console.log("- siswa@guruku.local");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
