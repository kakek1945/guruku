"use client";

import { useEffect, useMemo, useState } from "react";

import { AppIcon } from "@/components/app-icon";
import { AppBrand } from "@/components/app-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHomePageData } from "@/lib/api/public";
import type { HomePageApiResponse } from "@/lib/api-types";
import { materials, mediaAssets, teacherProfile, videoAssets } from "@/lib/mock-data";

const monthMap: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Agu: 7,
  Sep: 8,
  Okt: 9,
  Nov: 10,
  Des: 11,
};

const defaultAnnouncement = {
  title: "Pengumuman guru",
  detail: "Silakan cek materi terbaru dan ikuti arahan belajar yang dibagikan guru pada pekan ini.",
  date: "20 Apr 2026",
  teacherName: "Siti Rahma, S.Pd.",
};

function parseDateLabel(label: string) {
  const [day, month, year] = label.split(" ");
  return new Date(Number(year), monthMap[month] ?? 0, Number(day));
}

const defaultHomeData: HomePageApiResponse = {
  heroTickerText: teacherProfile.heroTickerText,
  announcement: defaultAnnouncement,
  weeklyRecap: {
    journal: {
      weekLabel: "Pekan jurnal terbaru",
      totalEntries: 0,
      classCount: 0,
      subjectCount: 0,
      latestItems: [],
    },
    attendance: {
      weekLabel: "Pekan absensi terbaru",
      absentStudents: [],
    },
  },
  latestMaterials: [...materials]
    .sort((a, b) => parseDateLabel(b.updatedAt).getTime() - parseDateLabel(a.updatedAt).getTime())
    .slice(0, 3),
  latestMedia: [...mediaAssets]
    .sort((a, b) => parseDateLabel(b.uploadedAt).getTime() - parseDateLabel(a.uploadedAt).getTime())
    .slice(0, 3),
  latestVideos: [...videoAssets]
    .sort((a, b) => parseDateLabel(b.publishedAt).getTime() - parseDateLabel(a.publishedAt).getTime())
    .slice(0, 3),
};

type ThumbnailCardProps = {
  label: string;
  title: string;
  meta: string;
  image: string;
};

function ThumbnailArt({
  image,
  label,
  title,
  meta,
  heightClass,
}: ThumbnailCardProps & { heightClass: string }) {
  return (
    <div className={`relative overflow-hidden ${heightClass}`} style={{ background: image }}>
      <div className="absolute left-5 top-5 rounded-full bg-[#fff8e7] px-3 py-1 text-xs font-medium text-foreground shadow-sm dark:bg-[#203b35] dark:text-[#f0e7c8]">
        {label}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-[#0f6b56] px-5 py-4 text-white dark:bg-[#102f2a]">
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
        <p className="mt-1 text-sm text-white/84">{meta}</p>
      </div>
    </div>
  );
}

function ThumbnailCard({ label, title, meta, image }: ThumbnailCardProps) {
  return (
    <div className="group overflow-hidden rounded-[30px] border border-[#e7dcc2] bg-white shadow-[0_18px_50px_rgba(63,52,28,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(63,52,28,0.12)] dark:border-border dark:bg-card dark:shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <ThumbnailArt image={image} label={label} title={title} meta={meta} heightClass="h-64" />
    </div>
  );
}

function HeroTile({
  label = "Terbaru",
  title,
  meta,
  image,
  className,
}: {
  label?: string;
  title: string;
  meta: string;
  image: string;
  className?: string;
}) {
  return (
    <div
      className={`group overflow-hidden rounded-[34px] border border-[#e7dcc2] bg-white shadow-[0_20px_60px_rgba(63,52,28,0.14)] dark:border-border dark:bg-card dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] ${className ?? ""}`}
    >
      <ThumbnailArt image={image} label={label} title={title} meta={meta} heightClass="h-full min-h-[220px]" />
    </div>
  );
}

function AnnouncementHeroCard({
  title,
  detail,
  date,
  teacherName,
}: HomePageApiResponse["announcement"]) {
  return (
    <Card className="group relative overflow-hidden border-[#d8caac] p-0 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,107,86,0.24)] dark:hover:shadow-[0_26px_70px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(243,217,142,0.46),_transparent_30%),linear-gradient(160deg,_#155848_0%,_#0f6b56_44%,_#0d4f42_100%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(243,217,142,0.16),_transparent_28%),linear-gradient(160deg,_#112925_0%,_#12342d_48%,_#102722_100%)]" />
      <div className="absolute inset-y-0 right-[-32%] w-[52%] -skew-x-12 bg-white/10 opacity-0 blur-2xl transition duration-500 group-hover:right-[-10%] group-hover:opacity-100" />
      <div className="absolute right-[-28px] top-[-28px] h-24 w-24 rounded-full border border-white/14 bg-white/8 blur-sm transition duration-300 group-hover:scale-110" />
      <div className="absolute bottom-[-24px] left-[-18px] h-20 w-20 rounded-full bg-[#f3d98e]/18 blur-2xl" />

      <div className="relative p-5 text-white md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Badge className="border-white/14 bg-white/10 text-white dark:border-white/12 dark:bg-white/10 dark:text-white">
            Informasi
          </Badge>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs text-white/88 backdrop-blur">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/12 animate-pulse">
              <AppIcon name="bell" className="h-3.5 w-3.5" />
            </span>
            <span>{date}</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <h2 className="text-[1.55rem] font-semibold leading-tight md:text-[1.9rem]">{title}</h2>
          </div>
          <p className="line-clamp-4 text-sm leading-6 text-white/84 md:text-[14px]">{detail}</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 transition duration-300 group-hover:bg-white/16">
              <AppIcon name="info" className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{teacherName}</p>
              <p className="text-xs text-white/70">Guru pengampu</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SectionTitle({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
      <Badge className="border border-[#e7dcc2] bg-[#fff8ea] text-accent-foreground">{badge}</Badge>
    </div>
  );
}

export default function HomePage() {
  const [data, setData] = useState<HomePageApiResponse>(defaultHomeData);

  useEffect(() => {
    let active = true;

    getHomePageData()
      .then((response) => {
        if (active) {
          setData(response);
        }
      })
      .catch(() => {
        // Keep frontend usable with the static fallback while the real API is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredMaterial = useMemo(() => data.latestMaterials[0], [data.latestMaterials]);
  const featuredVideo = useMemo(() => data.latestVideos[0], [data.latestVideos]);
  const featuredMedia = useMemo(() => data.latestMedia[0], [data.latestMedia]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative">
        <div className="container relative py-6 md:py-8">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[#eadfc6] bg-white px-5 py-4 shadow-[0_18px_48px_rgba(63,52,28,0.08)] dark:border-border dark:bg-card dark:shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
            <AppBrand />
            <div className="flex gap-2">
              <ThemeToggle />
              <Button href="/login">Login</Button>
            </div>
          </header>

          <div className="space-y-12 py-10 md:py-14">
            <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr] xl:items-stretch">
              <Card className="relative h-full overflow-hidden border-[#eadbc4] p-0 shadow-[0_24px_70px_rgba(63,52,28,0.12)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,241,199,0.88),_transparent_35%),linear-gradient(145deg,_#fffdf8_0%,_#f8f0df_52%,_#f1e7d1_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,183,104,0.16),_transparent_28%),linear-gradient(145deg,_#14231f_0%,_#193229_55%,_#1d3a30_100%)]" />
                <div className="absolute bottom-[-72px] left-[-28px] h-48 w-48 rounded-full bg-[#0f6b56]/10 blur-3xl dark:bg-[#3b8d78]/16" />
                <div className="absolute right-[-40px] top-[-40px] h-36 w-36 rounded-full bg-[#f3d98e]/45 blur-3xl dark:bg-[#d5b45d]/14" />

                <div className="relative h-full p-6 md:p-7">
                  <div className="space-y-5">
                    <div className="space-y-4">
                      <h1 className="max-w-[11ch] font-serif text-[2.7rem] font-semibold leading-[0.95] tracking-[-0.045em] text-[#1b2b26] md:text-[3.8rem] dark:text-[#f6f2e8]">
                        <span className="block">Belajar tanpa</span>
                        <span className="block">Batas</span>
                      </h1>
                      <p className="max-w-xl text-[15px] leading-6 text-[#495952] md:text-base dark:text-[#d5d0c4]">
                        Pengumuman guru, materi, media, dan video pembelajaran tersusun rapi agar siswa langsung tahu apa yang perlu dibaca lebih dulu.
                      </p>
                    </div>

                    <div className="hidden gap-2.5 md:grid md:grid-cols-3">
                      {[
                        { label: "Materi baru", value: `${data.latestMaterials.length}+`, icon: "materi" as const },
                        { label: "Media baru", value: `${data.latestMedia.length}+`, icon: "media" as const },
                        { label: "Video baru", value: `${data.latestVideos.length}+`, icon: "video" as const },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[22px] border border-[#ebdfc7] bg-white/88 px-3.5 py-3 shadow-sm backdrop-blur dark:border-border dark:bg-[#20362f]/88"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-[18px] bg-secondary text-primary">
                            <AppIcon name={item.icon} className="h-3.5 w-3.5" />
                          </div>
                          <p className="mt-2.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:text-[11px]">
                            {item.label}
                          </p>
                          <p className="mt-1 text-[1.55rem] font-semibold leading-none text-primary md:text-[1.65rem]">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid h-full gap-4 content-start">
                <AnnouncementHeroCard {...data.announcement} />

                <div className="grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
                  {featuredVideo ? (
                    <HeroTile
                      label="Video unggulan"
                      title={featuredVideo.title}
                      meta={`Video terbaru - ${featuredVideo.publishedAt}`}
                      image={featuredVideo.thumbnail}
                      className="min-h-[320px]"
                    />
                  ) : null}

                  <div className="grid gap-4">
                    {featuredMaterial ? (
                      <HeroTile
                        label="Materi inti"
                        title={featuredMaterial.title}
                        meta={`Materi - ${featuredMaterial.updatedAt}`}
                        image={featuredMaterial.thumbnail}
                        className="min-h-[152px]"
                      />
                    ) : null}
                    {featuredMedia ? (
                      <HeroTile
                        label="Media kelas"
                        title={featuredMedia.title}
                        meta={`Media - ${featuredMedia.uploadedAt}`}
                        image={featuredMedia.thumbnail}
                        className="min-h-[152px]"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[22px] border border-[#e8dcc1] bg-white/82 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f6b56] text-white">
                      <AppIcon name="bell" className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#0f6b56] dark:text-[#f2d689]">
                        Kata-kata hari ini
                      </p>
                      <div className="hero-marquee text-sm text-[#415049] dark:text-[#e4dece]">
                        <div className="hero-marquee-track">
                          <span>{data.heroTickerText}</span>
                          <span aria-hidden="true">{data.heroTickerText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section id="rekap" className="space-y-4">
              <SectionTitle title="Rekap Pekan Terbaru" badge="Jurnal & Absensi" />
              <div className="grid gap-5 xl:grid-cols-2">
                <Card className="overflow-hidden border-[#e6dcc5] p-0">
                  <div className="border-b border-[#eadfc7] bg-[#fffaf0] px-5 py-4 dark:border-border dark:bg-[#162823]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                          <AppIcon name="jurnal" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">Rekap jurnal mingguan</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Ringkasan aktivitas jurnal selama pekan terbaru.
                          </p>
                        </div>
                      </div>
                      <Badge className="border border-[#e7dcc2] bg-white/90 text-accent-foreground dark:bg-card/80">
                        {data.weeklyRecap.journal.weekLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-5 bg-white px-5 py-5 dark:bg-card">
                    <div className="rounded-[26px] border border-[#eadfc7] bg-[#fffaf0] p-4 dark:border-border dark:bg-[#162823]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">Catatan jurnal minggu ini</p>
                        <span className="text-xs text-muted-foreground">
                          {data.weeklyRecap.journal.latestItems.length} entri terbaru
                        </span>
                      </div>

                      {data.weeklyRecap.journal.latestItems.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {data.weeklyRecap.journal.latestItems.map((item) => (
                            <div
                              key={`${item.date}-${item.className}-${item.topic}`}
                              className="rounded-[22px] border border-[#e9dfca] bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold">{item.topic}</p>
                                <span className="text-xs text-muted-foreground">{item.date}</span>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.className} - {item.subject}
                              </p>
                              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary">{item.hours}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[22px] border border-dashed border-[#d8ccb2] bg-white/80 px-4 py-6 text-sm text-muted-foreground dark:border-border dark:bg-card/70">
                          Belum ada jurnal yang tersimpan pada pekan terbaru.
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden border-[#e6dcc5] p-0">
                  <div className="border-b border-[#eadfc7] bg-[#fffaf0] px-5 py-4 dark:border-border dark:bg-[#162823]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                          <AppIcon name="absensi" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">Rekap absensi mingguan</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Ringkasan absensi siswa selama pekan terbaru.
                          </p>
                        </div>
                      </div>
                      <Badge className="border border-[#e7dcc2] bg-white/90 text-accent-foreground dark:bg-card/80">
                        {data.weeklyRecap.attendance.weekLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-5 bg-white px-5 py-5 dark:bg-card">
                    <div className="rounded-[26px] border border-[#eadfc7] bg-[#fffaf0] p-4 dark:border-border dark:bg-[#162823]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">Daftar siswa tidak hadir</p>
                        <span className="text-xs text-muted-foreground">
                          {data.weeklyRecap.attendance.absentStudents.length} siswa
                        </span>
                      </div>

                      {data.weeklyRecap.attendance.absentStudents.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {data.weeklyRecap.attendance.absentStudents.map((item) => (
                            <div
                              key={`${item.attendanceDate}-${item.studentName}-${item.className}`}
                              className="rounded-[22px] border border-[#e9dfca] bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold">{item.studentName}</p>
                                <span className="text-xs text-muted-foreground">{item.attendanceDate}</span>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{item.className}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[22px] border border-dashed border-[#d8ccb2] bg-white/80 px-4 py-6 text-sm text-muted-foreground dark:border-border dark:bg-card/70">
                          Tidak ada siswa yang tercatat sakit, izin, atau alpha pada pekan terbaru.
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section id="materi" className="space-y-4">
              <SectionTitle title="Materi terbaru" badge="Urut terbaru" />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.latestMaterials.map((item) => (
                  <ThumbnailCard
                    key={`${item.title}-${item.updatedAt}`}
                    label={item.type}
                    title={item.title}
                    meta={`${item.className} - ${item.updatedAt}`}
                    image={item.thumbnail}
                  />
                ))}
              </div>
            </section>

            <section id="media" className="space-y-4">
              <SectionTitle title="Media terbaru" badge="Urut terbaru" />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.latestMedia.map((item) => (
                  <ThumbnailCard
                    key={`${item.title}-${item.uploadedAt}`}
                    label={item.format}
                    title={item.title}
                    meta={`${item.size} - ${item.uploadedAt}`}
                    image={item.thumbnail}
                  />
                ))}
              </div>
            </section>

            <section id="video" className="space-y-4">
              <SectionTitle title="Video terbaru" badge="Urut terbaru" />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.latestVideos.map((item) => (
                  <a
                    key={`${item.title}-${item.publishedAt}`}
                    href={item.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <ThumbnailCard
                      label={item.source}
                      title={item.title}
                      meta={`${item.className} - ${item.publishedAt}`}
                      image={item.thumbnail}
                    />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
