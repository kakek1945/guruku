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
  title,
  meta,
  image,
  className,
}: {
  title: string;
  meta: string;
  image: string;
  className?: string;
}) {
  return (
    <div
      className={`group overflow-hidden rounded-[34px] border border-[#e7dcc2] bg-white shadow-[0_20px_60px_rgba(63,52,28,0.14)] dark:border-border dark:bg-card dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] ${className ?? ""}`}
    >
      <ThumbnailArt image={image} label="Terbaru" title={title} meta={meta} heightClass="h-full min-h-[220px]" />
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
            <ThemeToggle />
          </header>

          <div className="space-y-12 py-10 md:py-14">
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card className="overflow-hidden p-0">
                <div className="h-full bg-[#fffdf8] p-7 dark:bg-[#182923] md:p-9">
                  <div className="space-y-5">
                    <Badge className="border border-[#ead8a7] bg-[#fff1c7] text-accent-foreground">
                      Konten terbaru
                    </Badge>
                    <h1 className="max-w-[11ch] font-serif text-[3rem] font-semibold leading-[0.93] tracking-[-0.045em] text-[#1b2b26] md:text-[4.2rem] dark:text-[#f6f2e8]">
                      <span className="block">Belajar tanpa</span>
                      <span className="block">Batas</span>
                    </h1>
                    <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                      Materi, media, video, dan info penting dalam satu halaman.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Materi baru", value: `${data.latestMaterials.length}+`, icon: "materi" as const },
                        { label: "Media baru", value: `${data.latestMedia.length}+`, icon: "media" as const },
                        { label: "Video baru", value: `${data.latestVideos.length}+`, icon: "video" as const },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[24px] border border-[#ebdfc7] bg-white/92 px-4 py-4 shadow-sm dark:border-border dark:bg-[#20362f]"
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
                    <div className="flex flex-wrap gap-3">
                      <Button href="#info" size="lg" variant="ghost">
                        Lihat informasi terbaru
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                {featuredVideo ? (
                  <HeroTile
                    title={featuredVideo.title}
                    meta={`Video terbaru - ${featuredVideo.publishedAt}`}
                    image={featuredVideo.thumbnail}
                    className="min-h-[340px]"
                  />
                ) : null}
                <div className="grid gap-4">
                  {featuredMaterial ? (
                    <HeroTile
                      title={featuredMaterial.title}
                      meta={`Materi - ${featuredMaterial.updatedAt}`}
                      image={featuredMaterial.thumbnail}
                      className="min-h-[160px]"
                    />
                  ) : null}
                  {featuredMedia ? (
                    <HeroTile
                      title={featuredMedia.title}
                      meta={`Media - ${featuredMedia.uploadedAt}`}
                      image={featuredMedia.thumbnail}
                      className="min-h-[160px]"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            <section id="info" className="space-y-4">
              <SectionTitle title="Pengumuman guru" badge="Info" />
              <Card className="overflow-hidden p-0">
                <div className="border-b border-[#e7dcc2] bg-[#114f43] px-5 py-4 text-white dark:border-border dark:bg-[#0f2f2a] md:px-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white">
                        <AppIcon name="bell" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Pengumuman guru</h3>
                        <p className="mt-1 text-sm text-white/80">
                          Informasi penting dari guru untuk seluruh siswa.
                        </p>
                      </div>
                    </div>
                    <Badge className="border-white/16 bg-white/10 text-white dark:border-white/12 dark:bg-white/10 dark:text-white">
                      Pengumuman
                    </Badge>
                  </div>
                </div>

                <div className="bg-[#fffdf8] px-5 py-5 dark:bg-[#182923] md:px-6 md:py-6">
                  <div className="rounded-[24px] border border-[#ebe2cf] bg-white p-5 shadow-[0_16px_36px_rgba(63,52,28,0.08)] dark:border-border dark:bg-[#10231f] dark:shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                        <AppIcon name="info" className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-foreground">{data.announcement.title}</p>
                          <span className="text-xs text-muted-foreground">oleh {data.announcement.teacherName}</span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{data.announcement.detail}</p>
                      </div>
                      <p className="whitespace-nowrap text-xs text-muted-foreground">{data.announcement.date}</p>
                    </div>
                  </div>
                </div>
              </Card>
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
