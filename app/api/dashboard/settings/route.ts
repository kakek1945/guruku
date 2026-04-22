import { NextResponse } from "next/server";

import { count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { students, teacherProfiles, user } from "@/lib/db/schema";
import { displayAuthLogin } from "@/lib/auth-login";
import { formatTeacherRoleLabel, getTeacherSubjects, serializeTeacherSubjects } from "@/lib/teacher-subjects";
import {
  ensureTeacherProfile,
  getSessionFromRequest,
  removeManagedUpload,
  savePublicImageUpload,
} from "@/lib/server/dashboard";

export const runtime = "nodejs";

function profileResponse(profile: Awaited<ReturnType<typeof ensureTeacherProfile>>) {
  const subjects = getTeacherSubjects(profile.role);

  return {
    name: profile.name,
    role: formatTeacherRoleLabel(profile.role),
    subjects,
    school: profile.school,
    nip: profile.nip || "",
    email: profile.email,
    phone: profile.phone || "",
    address: profile.address || "",
    profileImage: profile.profileImage || null,
    logoImage: profile.logoImage || null,
    announcementTitle: profile.announcementTitle || "",
    announcementBody: profile.announcementBody || "",
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const profile = await ensureTeacherProfile(session.user.id);
  const authUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });
  const [studentCountRow] = await db.select({ total: count() }).from(students);

  return NextResponse.json({
    profile: profileResponse(profile),
    studentCount: Number(studentCountRow?.total ?? 0),
    accountUsername: displayAuthLogin(authUser?.email || profile.email),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const currentProfile = await ensureTeacherProfile(session.user.id);
  const formData = await request.formData();
  const name = getFormValue(formData, "name");
  const role = getFormValue(formData, "role");
  const subjectsValue = getFormValue(formData, "subjects");
  const nip = getFormValue(formData, "nip");
  const announcementTitle = getFormValue(formData, "announcementTitle");
  const announcementBody = getFormValue(formData, "announcementBody");

  const subjects = getTeacherSubjects(subjectsValue || role);

  if (!name || subjects.length === 0) {
    return NextResponse.json(
      { message: "Nama guru dan mapel yang diampu wajib diisi." },
      { status: 400 },
    );
  }

  let profileImage = currentProfile.profileImage || null;
  let logoImage = currentProfile.logoImage || null;

  const profileFile = formData.get("profileImage");

  if (profileFile instanceof File && profileFile.size > 0) {
    profileImage = await savePublicImageUpload(profileFile, session.user.id, "profile");
    await removeManagedUpload(currentProfile.profileImage);
  }

  const logoFile = formData.get("logoImage");

  if (logoFile instanceof File && logoFile.size > 0) {
    logoImage = await savePublicImageUpload(logoFile, session.user.id, "logo");
    await removeManagedUpload(currentProfile.logoImage);
  }

  await db
    .update(teacherProfiles)
    .set({
      name,
      role: serializeTeacherSubjects(subjects),
      school: currentProfile.school,
      nip: nip || null,
      email: currentProfile.email,
      phone: currentProfile.phone,
      address: currentProfile.address,
      profileImage,
      logoImage,
      announcementTitle: announcementTitle || null,
      announcementBody: announcementBody || null,
      updatedAt: new Date(),
    })
    .where(eq(teacherProfiles.authUserId, session.user.id));

  await db
    .update(user)
    .set({
      name,
      image: profileImage,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  const updatedProfile = await ensureTeacherProfile(session.user.id);

  return NextResponse.json({
    message: "Perubahan guru berhasil disimpan.",
    profile: profileResponse(updatedProfile),
  });
}
