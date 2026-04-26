"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function getUsers() {
  const users = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  }).from(user);
  return users;
}

export async function toggleUserVerification(userId: string, currentStatus: boolean) {
  await db.update(user).set({ isVerified: !currentStatus }).where(eq(user.id, userId));
  revalidatePath("/dashboard/users");
}

export async function deleteUser(userId: string) {
  await db.delete(user).where(eq(user.id, userId));
  revalidatePath("/dashboard/users");
}

export async function createUserByAdmin(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || !role) {
    return { success: false, error: "Semua kolom wajib diisi" };
  }

  try {
    // We use Better Auth's server API to create the user, bypassing the client session
    // @ts-ignore
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        role,
        isVerified: true, // Auto verify if created by admin
      },
    });

    const createdUser = await db.query.user.findFirst({
        where: eq(user.email, email),
    });

    if (createdUser) {
        // Fallback update to enforce custom fields
        await db.update(user).set({
            role: role as any,
            isVerified: true,
        }).where(eq(user.id, createdUser.id));
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat pengguna" };
  }
}
