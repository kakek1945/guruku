import { config } from "dotenv";

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db, pool } from "@/lib/db";
import { students, teacherProfiles, user } from "@/lib/db/schema";
import { studentCsvTemplateRows, teacherProfile } from "@/lib/mock-data";

config({ path: ".env.local" });
config();

const adminSeed = {
  name: teacherProfile.name,
  email: teacherProfile.email,
  password: "guruku12345",
};

async function ensureAdminUser() {
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, adminSeed.email),
  });

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: adminSeed,
    });
  }

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
      name: teacherProfile.name,
      role: teacherProfile.role,
      school: teacherProfile.school,
      nip: teacherProfile.nip,
      email: teacherProfile.email,
      phone: teacherProfile.phone,
      address: teacherProfile.address,
    })
    .onConflictDoUpdate({
      target: teacherProfiles.authUserId,
      set: {
        name: teacherProfile.name,
        role: teacherProfile.role,
        school: teacherProfile.school,
        nip: teacherProfile.nip,
        email: teacherProfile.email,
        phone: teacherProfile.phone,
        address: teacherProfile.address,
        updatedAt: new Date(),
      },
    });
}

async function ensureStudents() {
  for (const row of studentCsvTemplateRows) {
    const [nis, name, className, gender] = row;

    await db
      .insert(students)
      .values({
        nis,
        name,
        className,
        gender,
      })
      .onConflictDoUpdate({
        target: students.nis,
        set: {
          name,
          className,
          gender,
          updatedAt: new Date(),
        },
      });
  }
}

async function main() {
  await ensureAdminUser();
  await ensureStudents();

  console.log("Database seeded successfully.");
  console.log(`Admin email: ${adminSeed.email}`);
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
