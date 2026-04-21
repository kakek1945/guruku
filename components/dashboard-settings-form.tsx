"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminAvatar } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDashboardSettings, saveDashboardAccount, saveDashboardSettings } from "@/lib/api/dashboard";
import type { DashboardSettingsApiResponse, DashboardSettingsProfile } from "@/lib/api-types";
import { teacherProfile as defaultTeacherProfile } from "@/lib/mock-data";

const defaultProfile: DashboardSettingsProfile = {
  name: defaultTeacherProfile.name,
  role: defaultTeacherProfile.role,
  school: defaultTeacherProfile.school,
  nip: defaultTeacherProfile.nip,
  email: defaultTeacherProfile.email,
  phone: defaultTeacherProfile.phone,
  address: defaultTeacherProfile.address,
  profileImage: null,
  logoImage: null,
  announcementTitle: defaultTeacherProfile.announcementTitle,
  announcementBody: defaultTeacherProfile.announcementBody,
};

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function DashboardSettingsForm() {
  const router = useRouter();
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<DashboardSettingsProfile>(defaultProfile);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [isSavingAccount, startSavingAccount] = useTransition();
  const [accountForm, setAccountForm] = useState({
    username: defaultTeacherProfile.email,
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    let active = true;

    getDashboardSettings()
      .then((response: DashboardSettingsApiResponse) => {
        if (!active) {
          return;
        }

        setProfile(response.profile);
        setAccountForm((current) => ({
          ...current,
          username: response.accountUsername,
        }));
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Data pengaturan belum dapat dimuat.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const profilePreview = useMemo(() => {
    if (selectedProfileFile) {
      return URL.createObjectURL(selectedProfileFile);
    }

    return profile.profileImage;
  }, [profile.profileImage, selectedProfileFile]);

  useEffect(() => {
    return () => {
      if (selectedProfileFile && profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview, selectedProfileFile]);

  const handleChange = (key: keyof DashboardSettingsProfile, value: string) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setLoadingMessage("Menyimpan biodata guru...");

    startSaving(async () => {
      const formData = new FormData();
      formData.set("name", profile.name);
      formData.set("role", profile.role);
      formData.set("nip", profile.nip);
      formData.set("email", profile.email);
      formData.set("phone", profile.phone);
      formData.set("address", profile.address);
      formData.set("announcementTitle", profile.announcementTitle);
      formData.set("announcementBody", profile.announcementBody);

      if (selectedProfileFile) {
        formData.set("profileImage", selectedProfileFile);
      }

      try {
        const response = await saveDashboardSettings(formData);

        setProfile(response.profile);
        setSelectedProfileFile(null);
        if (profileInputRef.current) {
          profileInputRef.current.value = "";
        }
        window.dispatchEvent(
          new CustomEvent("teacher-profile-updated", {
            detail: response.profile,
          }),
        );
        setFeedback({
          tone: "success",
          message: response.message,
        });
        router.refresh();
      } catch (error) {
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Perubahan belum dapat disimpan.",
        });
      } finally {
        setLoadingMessage("");
      }
    });
  };

  const handleAccountSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setLoadingMessage("Menyimpan akun login...");

    startSavingAccount(async () => {
      try {
        const response = await saveDashboardAccount(accountForm);

        setAccountForm({
          username: response.username,
          currentPassword: "",
          newPassword: "",
        });
        setFeedback({
          tone: "success",
          message: response.message,
        });
        router.refresh();
      } catch (error) {
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Akun login belum dapat disimpan.",
        });
      } finally {
        setLoadingMessage("");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Pengaturan admin"
        title="Biodata guru"
        description="Simpan identitas guru dan tulis pengumuman yang akan tampil di beranda."
        icon="settings"
        actions={<Button href="/dashboard">Kembali ke dashboard</Button>}
      />

      {feedback ? (
        <div
          className={`rounded-[22px] border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-[#cfe6da] bg-[#f6fbf8] text-[#1f6d59] dark:border-[#28584e] dark:bg-[#163a34] dark:text-[#d4efe6]"
              : "border-[#eed2c9] bg-[#fff6f3] text-[#a24a35] dark:border-[#6a3829] dark:bg-[#2d1813] dark:text-[#f3d0c5]"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {loadingMessage ? <p className="text-sm text-muted-foreground">{loadingMessage}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6 md:p-7">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Profil guru</p>
            <h2 className="text-2xl font-semibold">Biodata dan pengumuman</h2>
          </div>

          <form className="mt-6 grid gap-6" onSubmit={handleSave}>
            <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
              <div className="rounded-[24px] border border-border bg-muted/20 p-4 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#fff7e2]">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Foto profil guru" className="h-full w-full object-cover" />
                  ) : (
                    <AdminAvatar className="h-20 w-20" />
                  )}
                </div>
                <p className="mt-3 text-sm font-medium">Foto profil guru</p>
                <Input
                  id="profile-image"
                  ref={profileInputRef}
                  className="mt-3"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedProfileFile(event.target.files?.[0] || null)}
                />
                <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, atau WEBP.</p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nama guru" htmlFor="teacher-name">
                    <Input
                      id="teacher-name"
                      value={profile.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                    />
                  </Field>
                  <Field label="Mata pelajaran" htmlFor="teacher-role">
                    <Input
                      id="teacher-role"
                      value={profile.role}
                      onChange={(event) => handleChange("role", event.target.value)}
                    />
                  </Field>
                </div>

                <Field label="NIP / nomor induk" htmlFor="teacher-nip">
                  <Input
                    id="teacher-nip"
                    value={profile.nip}
                    onChange={(event) => handleChange("nip", event.target.value)}
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Email kontak" htmlFor="teacher-email">
                    <Input
                      id="teacher-email"
                      value={profile.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      placeholder="Opsional untuk kontak profil"
                    />
                  </Field>
                  <Field label="Nomor HP" htmlFor="teacher-phone">
                    <Input
                      id="teacher-phone"
                      value={profile.phone}
                      onChange={(event) => handleChange("phone", event.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Alamat singkat" htmlFor="teacher-address">
                  <Textarea
                    id="teacher-address"
                    value={profile.address}
                    onChange={(event) => handleChange("address", event.target.value)}
                  />
                </Field>

                <div className="grid gap-4 rounded-[24px] border border-border bg-muted/15 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Pengumuman guru</p>
                    <p className="text-xs text-muted-foreground">
                      Isi pengumuman ini akan tampil di halaman depan untuk siswa.
                    </p>
                  </div>

                  <Field label="Judul pengumuman" htmlFor="announcement-title">
                    <Input
                      id="announcement-title"
                      value={profile.announcementTitle}
                      onChange={(event) => handleChange("announcementTitle", event.target.value)}
                      placeholder="Contoh: Informasi pembelajaran minggu ini"
                    />
                  </Field>

                  <Field label="Isi pengumuman" htmlFor="announcement-body">
                    <Textarea
                      id="announcement-body"
                      value={profile.announcementBody}
                      onChange={(event) => handleChange("announcementBody", event.target.value)}
                      placeholder="Tuliskan informasi yang ingin dibaca siswa di beranda."
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit" aria-busy={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan perubahan"}
              </Button>
              <Button href="/dashboard" variant="ghost">
                Selesai
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 md:p-7">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Akun admin / guru</p>
            <h2 className="text-2xl font-semibold">Username dan password</h2>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleAccountSave}>
            <Field label="Username / login" htmlFor="account-username">
              <Input
                id="account-username"
                value={accountForm.username}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
              />
            </Field>

            <Field label="Password saat ini" htmlFor="account-current-password">
              <Input
                id="account-current-password"
                type="password"
                value={accountForm.currentPassword}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                placeholder="Isi jika ingin mengganti password"
              />
            </Field>

            <Field label="Password baru" htmlFor="account-new-password">
              <Input
                id="account-new-password"
                type="password"
                value={accountForm.newPassword}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                placeholder="Kosongkan jika tidak diganti"
              />
            </Field>

            <div className="rounded-[20px] border border-border bg-muted/20 px-4 py-3 text-[13px] text-muted-foreground">
              Username/login yang disimpan di sini akan dipakai untuk masuk ke dashboard pada login berikutnya.
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit" aria-busy={isSavingAccount}>
                {isSavingAccount ? "Menyimpan..." : "Simpan akun"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
