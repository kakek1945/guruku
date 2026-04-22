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
  subjects: [defaultTeacherProfile.role],
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
  const [subjectInput, setSubjectInput] = useState(defaultTeacherProfile.role);
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
        setSubjectInput(response.profile.subjects.join("\n"));
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
      formData.set("role", subjectInput);
      formData.set("subjects", subjectInput);
      formData.set("nip", profile.nip);
      formData.set("announcementTitle", profile.announcementTitle);
      formData.set("announcementBody", profile.announcementBody);

      if (selectedProfileFile) {
        formData.set("profileImage", selectedProfileFile);
      }

      try {
        const response = await saveDashboardSettings(formData);

        setProfile(response.profile);
        setSubjectInput(response.profile.subjects.join("\n"));
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
            <div className="grid gap-6">
              <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start">
                <div className="rounded-[28px] border border-border bg-muted/20 p-5">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#fff7e2] shadow-sm">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Foto profil guru" className="h-full w-full object-cover" />
                      ) : (
                        <AdminAvatar className="h-24 w-24" />
                      )}
                    </div>
                    <p className="mt-4 text-base font-semibold">Foto profil guru</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Gunakan foto yang jelas agar tampilan profil di dashboard lebih rapi.
                    </p>
                  </div>

                  <Input
                    id="profile-image"
                    ref={profileInputRef}
                    className="mt-5"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setSelectedProfileFile(event.target.files?.[0] || null)}
                  />

                  <div className="mt-4 grid gap-3 rounded-[22px] border border-border bg-card px-4 py-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Preview profil</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{profile.name || "Nama guru belum diisi"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {profile.nip ? `NIP ${profile.nip}` : "NIP belum diisi"}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
                      Format yang disarankan: JPG, PNG, atau WEBP dengan ukuran proporsional.
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 rounded-[28px] border border-border bg-card p-5 md:p-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Data utama guru</p>
                    <p className="text-xs text-muted-foreground">
                      Lengkapi nama, mapel yang diampu, dan nomor induk pada satu area yang lebih ringkas.
                    </p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <Field label="Nama guru" htmlFor="teacher-name">
                      <Input
                        id="teacher-name"
                        value={profile.name}
                        onChange={(event) => handleChange("name", event.target.value)}
                      />
                    </Field>
                    <Field label="NIP / nomor induk" htmlFor="teacher-nip">
                      <Input
                        id="teacher-nip"
                        value={profile.nip}
                        onChange={(event) => handleChange("nip", event.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Mapel yang diampu" htmlFor="teacher-role">
                    <Textarea
                      id="teacher-role"
                      className="min-h-[132px]"
                      value={subjectInput}
                      onChange={(event) => setSubjectInput(event.target.value)}
                      placeholder={"Contoh:\nMatematika\nIPA"}
                    />
                    <p className="text-xs leading-5 text-muted-foreground">
                      Isi satu mapel per baris. Kalau guru mengampu lebih dari satu mapel, semuanya akan otomatis muncul di kelas, jurnal, dan absensi.
                    </p>
                  </Field>
                </div>
              </div>

              <div className="grid gap-4 rounded-[28px] border border-border bg-muted/15 p-5 md:p-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Pengumuman guru</p>
                  <p className="text-xs text-muted-foreground">
                    Area ini dibuat melebar penuh agar lebih nyaman saat menulis pengumuman panjang.
                  </p>
                </div>

                <Field label="Judul pengumuman" htmlFor="announcement-title">
                  <Input
                    id="announcement-title"
                    className="max-w-[420px]"
                    value={profile.announcementTitle}
                    onChange={(event) => handleChange("announcementTitle", event.target.value)}
                    placeholder="Contoh: Informasi pembelajaran minggu ini"
                  />
                </Field>

                <Field label="Isi pengumuman" htmlFor="announcement-body">
                  <Textarea
                    id="announcement-body"
                    className="min-h-[260px] w-full md:min-h-[320px]"
                    value={profile.announcementBody}
                    onChange={(event) => handleChange("announcementBody", event.target.value)}
                    placeholder="Tuliskan informasi yang ingin dibaca siswa di beranda."
                  />
                </Field>
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
