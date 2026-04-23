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
import { materials, mediaAssets, videoAssets } from "@/lib/mock-data";

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
  announcement: defaultAnnouncement,
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
            <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
              <Card className="relative overflow-hidden border-[#eadbc4] p-0 shadow-[0_28px_70px_rgba(63,52,28,0.14)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,241,199,0.95),_transparent_38%),linear-gradient(140deg,_#fffdf7_0%,_#f6efe0_48%,_#efe6d4_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(205,171,105,0.18),_transparent_30%),linear-gradient(145deg,_#11211d_0%,_#173129_52%,_#204238_100%)]" />
                <div className="absolute right-[-52px] top-[-52px] h-40 w-40 rounded-full bg-[#f3d98e]/55 blur-3xl dark:bg-[#d5b45d]/15" />
                <div className="absolute bottom-[-86px] left-[-20px] h-52 w-52 rounded-full bg-[#0f6b56]/12 blur-3xl dark:bg-[#3b8d78]/18" />

                <div className="relative h-full p-7 md:p-9">
                  <div className="flex h-full flex-col justify-between gap-8">
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="border border-[#ead8a7] bg-[#fff1c7] text-accent-foreground">
                          Pengumuman utama
                        </Badge>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d8cfb8] bg-white/75 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[#f3ebd0]">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f6b56] text-white">
                            <AppIcon name="bell" className="h-3.5 w-3.5" />
                          </span>
                          <span>{data.announcement.date}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#0f6b56] dark:text-[#f2d689]">
                          Dari {data.announcement.teacherName}
                        </p>
                        <h1 className="max-w-[12ch] font-serif text-[3rem] font-semibold leading-[0.92] tracking-[-0.05em] text-[#1b2b26] md:text-[4.3rem] dark:text-[#f6f2e8]">
                          Siswa langsung melihat arahan guru sejak halaman dibuka.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-[#43534d] md:text-lg dark:text-[#d6d0c3]">
                          Pengumuman penting kami taruh di panggung utama supaya perhatian siswa langsung tertuju ke pesan terbaru sebelum menjelajahi materi, media, dan video.
                        </p>
                      </div>

                      <div className="rounded-[30px] border border-[#d7c8a9] bg-[#0f6b56] p-5 text-white shadow-[0_22px_60px_rgba(15,107,86,0.24)] dark:border-white/10 dark:bg-[#102f2a] dark:shadow-[0_22px_60px_rgba(0,0,0,0.28)] md:p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-white/72">Pesan guru</p>
                            <div>
                              <h2 className="text-2xl font-semibold leading-tight md:text-[2rem]">
                                {data.announcement.title}
                              </h2>
                              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
                                {data.announcement.detail}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-[22px] border border-white/12 bg-white/10 px-4 py-3 text-sm text-white/88 backdrop-blur">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white">
                              <AppIcon name="info" className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Prioritas siswa</p>
                              <p className="text-xs text-white/72">Baca dulu, lalu lanjut belajar</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          { label: "Materi baru", value: `${data.latestMaterials.length}+`, icon: "materi" as const },
                          { label: "Media baru", value: `${data.latestMedia.length}+`, icon: "media" as const },
                          { label: "Video baru", value: `${data.latestVideos.length}+`, icon: "video" as const },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[24px] border border-[#ebdfc7] bg-white/88 px-4 py-4 shadow-sm backdrop-blur dark:border-border dark:bg-[#20362f]/90"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary text-primary">
                              <AppIcon name={item.icon} className="h-4 w-4" />
                            </div>
                            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {item.label}
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-primary">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button href="#materi" size="lg">
                        Mulai dari materi terbaru
                      </Button>
                      <Button href="#video" size="lg" variant="ghost">
                        Lanjut ke video pembelajaran
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4">
                <Card className="overflow-hidden border-[#eadbc4] bg-[#fffaf0] p-0 dark:bg-[#162823]">
                  <div className="border-b border-[#e6d7b7] px-5 py-4 dark:border-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Pendukung pengumuman
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-[#1b2b26] dark:text-[#f6f2e8]">
                          Lanjutkan ke konten terbaru
                        </h2>
                      </div>
                      <Badge className="border border-[#ead8a7] bg-[#fff1c7] text-accent-foreground">
                        Update kelas
                      </Badge>
                    </div>
                  </div>
                  <div className="grid gap-4 p-4">
                    {featuredVideo ? (
                      <HeroTile
                        label="Video unggulan"
                        title={featuredVideo.title}
                        meta={`Video terbaru - ${featuredVideo.publishedAt}`}
                        image={featuredVideo.thumbnail}
                        className="min-h-[280px]"
                      />
                    ) : null}
                    <div className="grid gap-4 md:grid-cols-2">
                      {featuredMaterial ? (
                        <HeroTile
                          label="Materi inti"
                          title={featuredMaterial.title}
                          meta={`Materi - ${featuredMaterial.updatedAt}`}
                          image={featuredMaterial.thumbnail}
                          className="min-h-[160px]"
                        />
                      ) : null}
                      {featuredMedia ? (
                        <HeroTile
                          label="Media kelas"
                          title={featuredMedia.title}
                          meta={`Media - ${featuredMedia.uploadedAt}`}
                          image={featuredMedia.thumbnail}
                          className="min-h-[160px]"
                        />
                      ) : null}
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      title: "Buka pengumuman",
                      detail: "Fokus pertama siswa saat masuk ke halaman.",
                    },
                    {
                      title: "Pilih materi",
                      detail: "Setelah membaca info guru, siswa bisa lanjut belajar.",
                    },
                    {
                      title: "Tonton video",
                      detail: "Konten pendukung tetap terlihat tanpa menggeser fokus utama.",
                    },
                  ].map((item, index) => (
                    <Card
                      key={item.title}
                      className="border-[#eadbc4] bg-white/88 p-5 shadow-[0_16px_40px_rgba(63,52,28,0.09)] dark:bg-card/90"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-primary">
                        0{index + 1}
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

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
