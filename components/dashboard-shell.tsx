"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminAvatar, AppIcon, IconName } from "@/components/app-icon";
import { AuthActions } from "@/components/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { getDashboardSettings } from "@/lib/api/dashboard";
import type { DashboardSettingsProfile } from "@/lib/api-types";
import { teacherProfile } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" as IconName },
  { label: "Kelas", href: "/dashboard/kelas", icon: "kelas" as IconName },
  { label: "Jurnal", href: "/dashboard/jurnal", icon: "jurnal" as IconName },
  { label: "Absensi", href: "/dashboard/absensi", icon: "absensi" as IconName },
  { label: "Nilai", href: "/dashboard/nilai", icon: "nilai" as IconName },
  { label: "Materi, Media & Video", href: "/dashboard/materi", icon: "materi" as IconName },
  { label: "Pengaturan", href: "/dashboard/pengaturan", icon: "settings" as IconName },
];

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<DashboardSettingsProfile>({
    name: teacherProfile.name,
    role: teacherProfile.role,
    subjects: [teacherProfile.role],
    school: teacherProfile.school,
    nip: teacherProfile.nip,
    email: teacherProfile.email,
    phone: teacherProfile.phone,
    address: teacherProfile.address,
    heroTickerText: teacherProfile.heroTickerText,
    profileImage: null,
    logoImage: null,
    announcementTitle: teacherProfile.announcementTitle,
    announcementBody: teacherProfile.announcementBody,
  });

  useEffect(() => {
    let active = true;

    getDashboardSettings()
      .then((response) => {
        if (active) {
          setProfile(response.profile);
        }
      })
      .catch(() => {
        // Keep fallback teacher data when the profile API is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<DashboardSettingsProfile>;

      if (customEvent.detail) {
        setProfile(customEvent.detail);
      }
    };

    window.addEventListener("teacher-profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("teacher-profile-updated", handleProfileUpdated);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className="bg-[#1f6d59] px-4 py-4 text-white dark:bg-[#163a34] lg:flex lg:min-h-screen lg:w-[236px] lg:flex-col lg:border-r lg:border-[#d7cfbe] lg:px-4 lg:py-5 dark:lg:border-[#28463f]">
          <div className="rounded-[22px] border border-white/10 bg-white/8 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:border-white/8 dark:bg-white/6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/10">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Foto guru" className="h-full w-full object-cover" />
                ) : (
                  <AdminAvatar className="h-12 w-12" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/60">Profil Guru</p>
                <h1 className="mt-1 truncate text-[13px] font-semibold leading-none text-white">
                  {profile.name}
                </h1>
                <p className="mt-1 text-[11px] text-white/72">{profile.role}</p>
              </div>
            </div>
          </div>

          <nav className="mt-5 grid gap-1.5">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[16px] px-3 py-2 text-[13px] transition",
                    active
                      ? "bg-[#fff8ea] text-[#1f6d59] shadow-sm dark:bg-[#e7d49d] dark:text-[#173c35]"
                      : "text-white/82 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl transition",
                      active ? "bg-[#f0ddad] text-[#1f6d59]" : "bg-white/10 text-white",
                    )}
                  >
                    <AppIcon name={item.icon} className="h-[17px] w-[17px]" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3">
            <AuthActions className="w-full justify-center border-white/12 bg-white/10 text-white hover:bg-white/16 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/16" />
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-[#d7cfbe] bg-[#fcfaf4]/92 backdrop-blur dark:border-border dark:bg-[#122b26]/92">
            <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <p className="text-xs text-muted-foreground">{profile.school}</p>
                <h2 className="text-[1.15rem] font-semibold text-foreground sm:text-[1.3rem]">Semester Genap 2025/2026</h2>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle className="hidden sm:inline-flex" />
                <Badge className="hidden w-fit border border-[#e4d7ba] bg-[#fff8ea] text-accent-foreground sm:inline-flex">
                  {profile.role}
                </Badge>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
