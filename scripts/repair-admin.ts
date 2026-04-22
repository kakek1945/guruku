import { config } from "dotenv";

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { normalizeAuthLogin } from "@/lib/auth-login";
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

const loginAlias = "admin@guruku";
const loginEmail = normalizeAuthLogin(loginAlias);
const password = "P4ssw0rd";

async function resetAppData() {
  await db.delete(attendanceRegisters);
  await db.delete(scoreRegisters);
  await db.delete(journals);
  await db.delete(materialsLibrary);
  await db.delete(mediaLibrary);
  await db.delete(videoLibrary);
  await db.delete(classesCatalog);
  await db.delete(students);
}

async function removeInvalidAdminAlias() {
  const invalidUser = await db.query.user.findFirst({
    where: eq(user.email, loginAlias),
  });

  if (!invalidUser) {
    return;
  }

  await db.delete(teacherProfiles).where(eq(teacherProfiles.authUserId, invalidUser.id));
  await db.delete(user).where(eq(user.id, invalidUser.id));
}

async function createOrRepairAdmin() {
  let createdUser = await db.query.user.findFirst({
    where: eq(user.email, loginEmail),
  });

  if (!createdUser) {
    await auth.api.signUpEmail({
      body: {
        name: "Admin GuruKu",
        email: loginEmail,
        password,
      },
    });

    createdUser = await db.query.user.findFirst({
      where: eq(user.email, loginEmail),
    });
  }

  if (!createdUser) {
    throw new Error("Admin account could not be created.");
  }

  await db
    .insert(teacherProfiles)
    .values({
      authUserId: createdUser.id,
      name: "Admin GuruKu",
      role: "Mapel belum diatur",
      school: "SMP Negeri Kep. Meranti",
      nip: null,
      email: loginAlias,
      phone: null,
      address: null,
      announcementTitle: "Pengumuman guru",
      announcementBody: "Belum ada pengumuman.",
    })
    .onConflictDoUpdate({
      target: teacherProfiles.authUserId,
      set: {
        name: "Admin GuruKu",
        role: "Mapel belum diatur",
        school: "SMP Negeri Kep. Meranti",
        nip: null,
        email: loginAlias,
        phone: null,
        address: null,
        announcementTitle: "Pengumuman guru",
        announcementBody: "Belum ada pengumuman.",
        updatedAt: new Date(),
      },
    });

  return createdUser;
}

async function main() {
  await resetAppData();
  await removeInvalidAdminAlias();
  const createdUser = await createOrRepairAdmin();

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, createdUser.id),
  });

  const currentProfile = await db.query.teacherProfiles.findFirst({
    where: eq(teacherProfiles.authUserId, createdUser.id),
  });

  console.log(
    JSON.stringify(
      {
        loginAlias,
        loginEmail,
        password,
        user: currentUser
          ? {
              id: currentUser.id,
              email: currentUser.email,
              name: currentUser.name,
            }
          : null,
        profile: currentProfile
          ? {
              email: currentProfile.email,
              name: currentProfile.name,
              role: currentProfile.role,
            }
          : null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
