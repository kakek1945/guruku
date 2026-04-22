"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppIcon } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDashboardOverview, getDashboardSettings } from "@/lib/api/dashboard";
import type { DashboardOverviewApiResponse, DashboardSettingsProfile } from "@/lib/api-types";
import { classAssignments, dashboardMetrics, quickActions, scheduleToday, teacherProfile } from "@/lib/mock-data";

const defaultDashboardData: DashboardOverviewApiResponse = {
  metrics: dashboardMetrics,
  quickActions,
  scheduleToday,
  classAssignments,
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverviewApiResponse>(defaultDashboardData);
  const [profile, setProfile] = useState<DashboardSettingsProfile>({
    name: teacherProfile.name,
    role: teacherProfile.role,
    subjects: [teacherProfile.role],
    school: teacherProfile.school,
    nip: teacherProfile.nip,
    email: teacherProfile.email,
    phone: teacherProfile.phone,
    address: teacherProfile.address,
    profileImage: null,
    logoImage: null,
    announcementTitle: teacherProfile.announcementTitle,
    announcementBody: teacherProfile.announcementBody,
  });

  useEffect(() => {
    let active = true;

    getDashboardOverview()
      .then((response) => {
        if (active) {
          setData(response);
        }
      })
      .catch(() => {
        // Keep demo data when the API server is not wired yet.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    getDashboardSettings()
      .then((response) => {
        if (active) {
          setProfile(response.profile);
        }
      })
      .catch(() => {
        // Keep fallback teacher name when settings API is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Dashboard"
        title={`Halo, ${profile.name}`}
        description="Pilih aksi lalu lanjut input."
        icon="dashboard"
        actions={
          <>
            <Button href="/dashboard/jurnal">Jurnal</Button>
            <Button href="/dashboard/absensi" variant="ghost">
              Absensi
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric, index) => (
          <Card key={metric.label} className="p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-[18px] bg-secondary text-primary">
              <AppIcon name={(["calendar", "check", "users", "nilai"] as const)[index] ?? "info"} className="h-4 w-4" />
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">{metric.label}</p>
            <p className="mt-1.5 text-[1.7rem] font-semibold leading-none">{metric.value}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{metric.note}</p>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[1.35rem] font-semibold">Menu cepat</h2>
          <Badge className="bg-white text-foreground dark:bg-card">4 aksi utama</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full p-4 transition hover:-translate-y-0.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-[18px] text-white ${action.accent}`}>
                  <AppIcon
                    name={
                      action.href.includes("jurnal")
                        ? "jurnal"
                        : action.href.includes("absensi")
                          ? "absensi"
                          : action.href.includes("nilai")
                            ? "nilai"
                            : "materi"
                    }
                    className="h-4 w-4"
                  />
                </div>
                <h3 className="mt-3 text-[1.05rem] font-semibold">{action.title}</h3>
                <p className="mt-1.5 text-[13px] text-muted-foreground">{action.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.35rem] font-semibold">Hari ini</h2>
            <Badge className="bg-accent text-accent-foreground">3 sesi</Badge>
          </div>

          <div className="mt-5 grid gap-3">
            {data.scheduleToday.map((item) => (
              <div
                key={`${item.time}-${item.className}`}
                className="flex flex-col gap-3 rounded-[20px] border border-border bg-[#fcfaf7] p-3.5 dark:bg-[#182923] md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <AppIcon name="calendar" className="h-4 w-4" />
                    {item.time}
                  </p>
                  <p className="mt-1 text-[1rem] font-semibold">
                    {item.className} - {item.topic}
                  </p>
                </div>
                <Badge className="w-fit bg-white text-foreground dark:bg-card">{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-[1.35rem] font-semibold">Kelas</h2>
            <Button href="/dashboard/kelas" variant="ghost">
              Lihat semua
            </Button>
          </div>
          <div className="grid gap-3">
            {data.classAssignments.map((item) => (
              <div key={item.className} className="rounded-[20px] border border-border bg-white p-3.5 dark:bg-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-[1rem] font-semibold">
                      <AppIcon name="kelas" className="h-4 w-4 text-primary" />
                      {item.className}
                    </p>
                    <p className="text-[13px] text-muted-foreground">{item.subject}</p>
                  </div>
                  <Badge className="bg-white text-foreground dark:bg-card">{item.students} siswa</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
