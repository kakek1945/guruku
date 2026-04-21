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

const adminSeed = {
  name: "Admin GuruKu",
  email: "admin@guruku.local",
  password: "P4ssw0rd",
};

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

async function ensureAdminUser() {
  await auth.api.signUpEmail({
    body: adminSeed,
  });

  const createdUser = await db.query.user.findFirst({
    where: eq(user.email, adminSeed.email),
  });

  if (!createdUser) {
    throw new Error("Failed to create or find seeded admin user.");
  }

  await db
    .insert(teacherProfiles)
    .values({
      authUserId: createdUser.id,
      name: "Admin GuruKu",
      role: "Administrator",
      school: "SMP Negeri Kep. Meranti",
      nip: null,
      email: "admin@guruku",
      phone: null,
      address: null,
      announcementTitle: "Pengumuman guru",
      announcementBody: "Belum ada pengumuman.",
    })
    .onConflictDoUpdate({
      target: teacherProfiles.authUserId,
      set: {
        name: "Admin GuruKu",
        role: "Administrator",
        school: "SMP Negeri Kep. Meranti",
        nip: null,
        email: "admin@guruku",
        phone: null,
        address: null,
        announcementTitle: "Pengumuman guru",
        announcementBody: "Belum ada pengumuman.",
        updatedAt: new Date(),
      },
    });
}

async function main() {
  await resetStoredData();
  await ensureAdminUser();

  console.log("Database reset completed successfully.");
  console.log("Admin username: admin@guruku");
  console.log(`Admin password: ${adminSeed.password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
