"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { AppIcon } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getClasses, getMediaVideos, saveMediaOrVideo } from "@/lib/api/dashboard";
import type { MediaItem, MediaVideosApiResponse, VideoItem } from "@/lib/api-types";
import { mediaAssets, videoAssets } from "@/lib/mock-data";

const fallbackMedia: MediaItem[] = mediaAssets.map((item, index) => ({
  id: `${item.title}-${index}`,
  title: item.title,
  format: item.format,
  size: item.size,
  linkedTo: item.linkedTo,
  uploadedAt: item.uploadedAt,
  thumbnail: item.thumbnail,
  filePath: null,
}));

const fallbackVideos: VideoItem[] = videoAssets.map((item, index) => ({
  id: `${item.title}-${index}`,
  title: item.title,
  source: item.source,
  className: item.className,
  topic: item.topic,
  linkedTo: item.linkedTo,
  publishedAt: item.publishedAt,
  videoUrl: item.videoUrl,
  thumbnail: item.thumbnail,
}));

export function DashboardMediaVideoManager() {
  const mediaFileRef = useRef<HTMLInputElement | null>(null);
  const mediaThumbRef = useRef<HTMLInputElement | null>(null);
  const videoThumbRef = useRef<HTMLInputElement | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(fallbackMedia);
  const [videoItems, setVideoItems] = useState<VideoItem[]>(fallbackVideos);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [classOptions, setClassOptions] = useState(["VII-A", "VIII-B", "IX-A"]);

  const [mediaForm, setMediaForm] = useState({
    title: "",
    format: "PNG",
    linkedTo: "",
    thumbnailUrl: "",
  });
  const [videoForm, setVideoForm] = useState({
    title: "",
    className: "VII-A",
    topic: "",
    videoUrl: "",
    source: "YouTube",
    linkedTo: "",
    thumbnailUrl: "",
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaThumbnailFile, setMediaThumbnailFile] = useState<File | null>(null);
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);

  const loadItems = async () => {
    const response = await getMediaVideos();
    setMediaItems(response.mediaItems);
    setVideoItems(response.videoItems);
  };

  useEffect(() => {
    getClasses({
      className: videoForm.className,
      subject: "",
      search: "",
    })
      .then((response) => {
        setClassOptions(response.classOptions.length > 0 ? response.classOptions : ["VII-A", "VIII-B", "IX-A"]);
      })
      .catch(() => {
        // Keep fallback class list.
      });
  }, [videoForm.className]);

  useEffect(() => {
    loadItems().catch(() => {
      // Keep fallback.
    });
  }, []);

  const mediaPreview = useMemo(() => {
    if (mediaThumbnailFile) {
      return `center / cover no-repeat url("${URL.createObjectURL(mediaThumbnailFile)}")`;
    }

    return mediaForm.thumbnailUrl || mediaItems[0]?.thumbnail || "#90c1ad";
  }, [mediaForm.thumbnailUrl, mediaItems, mediaThumbnailFile]);

  const videoPreview = useMemo(() => {
    if (videoThumbnailFile) {
      return `center / cover no-repeat url("${URL.createObjectURL(videoThumbnailFile)}")`;
    }

    return videoForm.thumbnailUrl || videoItems[0]?.thumbnail || "#2d8a71";
  }, [videoForm.thumbnailUrl, videoItems, videoThumbnailFile]);

  const handleSave = (kind: "media" | "video") => {
    setFeedback("");

    startTransition(async () => {
      try {
        const formData = new FormData();

        if (kind === "media") {
          formData.set("kind", "media");
          Object.entries(mediaForm).forEach(([key, value]) => formData.set(key, value));
          if (mediaFile) {
            formData.set("mediaFile", mediaFile);
          }
          if (mediaThumbnailFile) {
            formData.set("thumbnailFile", mediaThumbnailFile);
          }
        } else {
          formData.set("kind", "video");
          Object.entries(videoForm).forEach(([key, value]) => formData.set(key, value));
          if (videoThumbnailFile) {
            formData.set("thumbnailFile", videoThumbnailFile);
          }
        }

        const response = await saveMediaOrVideo(formData);
        setFeedback(response.message);

        if (kind === "media") {
          setMediaForm({
            title: "",
            format: "PNG",
            linkedTo: "",
            thumbnailUrl: "",
          });
          setMediaFile(null);
          setMediaThumbnailFile(null);
          if (mediaFileRef.current) {
            mediaFileRef.current.value = "";
          }
          if (mediaThumbRef.current) {
            mediaThumbRef.current.value = "";
          }
        } else {
          setVideoForm({
            title: "",
            className: "VII-A",
            topic: "",
            videoUrl: "",
            source: "YouTube",
            linkedTo: "",
            thumbnailUrl: "",
          });
          setVideoThumbnailFile(null);
          if (videoThumbRef.current) {
            videoThumbRef.current.value = "";
          }
        }

        await loadItems();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Data belum dapat disimpan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Media pembelajaran & video guru"
        title="Media, video, dan thumbnail"
        description="Atur thumbnail konten dan masukkan link video dari YouTube atau web lain."
        icon="video"
        actions={<Button href="/dashboard/materi">Kembali ke materi</Button>}
      />

      {feedback ? (
        <div className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Tambah media pembelajaran</p>
          <h2 className="mt-1 text-2xl font-semibold">Media dan cover</h2>
          <div className="mt-6 grid gap-4">
            <div>
              <Label htmlFor="media-title">Nama media</Label>
              <Input id="media-title" value={mediaForm.title} onChange={(event) => setMediaForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="media-format">Format</Label>
                <Select id="media-format" value={mediaForm.format} onChange={(event) => setMediaForm((current) => ({ ...current, format: event.target.value }))}>
                  <option>PNG</option>
                  <option>JPG</option>
                  <option>MP3</option>
                  <option>PPT</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="media-link">Tautkan ke jurnal / materi</Label>
                <Input id="media-link" value={mediaForm.linkedTo} onChange={(event) => setMediaForm((current) => ({ ...current, linkedTo: event.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="media-file">Upload file</Label>
                <Input id="media-file" ref={mediaFileRef} type="file" onChange={(event) => setMediaFile(event.target.files?.[0] || null)} />
              </div>
              <div>
                <Label htmlFor="media-thumbnail">URL thumbnail media</Label>
                <Input id="media-thumbnail" value={mediaForm.thumbnailUrl} onChange={(event) => setMediaForm((current) => ({ ...current, thumbnailUrl: event.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="media-thumbnail-file">Upload thumbnail media</Label>
              <Input id="media-thumbnail-file" ref={mediaThumbRef} type="file" accept="image/*" onChange={(event) => setMediaThumbnailFile(event.target.files?.[0] || null)} />
            </div>
            <div className="rounded-[24px] border border-border bg-[#fcfaf7] p-4 dark:bg-muted/20">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AppIcon name="media" className="h-4 w-4 text-primary" />
                Preview thumbnail media
              </p>
              <div className="mt-4 h-40 rounded-[20px] bg-cover bg-center" style={{ background: mediaPreview }} />
            </div>
            <Button type="button" className="w-full sm:w-fit" onClick={() => handleSave("media")} aria-busy={isPending}>
              {isPending ? "Menyimpan..." : "Simpan media"}
            </Button>
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Tambah video guru</p>
          <h2 className="mt-1 text-2xl font-semibold">Link video dan cover</h2>
          <div className="mt-6 grid gap-4">
            <div>
              <Label htmlFor="video-title">Judul video</Label>
              <Input id="video-title" value={videoForm.title} onChange={(event) => setVideoForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="video-class">Kelas</Label>
                <Select id="video-class" value={videoForm.className} onChange={(event) => setVideoForm((current) => ({ ...current, className: event.target.value }))}>
                  {classOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="video-topic">Topik</Label>
                <Input id="video-topic" value={videoForm.topic} onChange={(event) => setVideoForm((current) => ({ ...current, topic: event.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="video-source">Link video</Label>
              <Input id="video-source" value={videoForm.videoUrl} onChange={(event) => setVideoForm((current) => ({ ...current, videoUrl: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="video-provider">Sumber</Label>
                <Select id="video-provider" value={videoForm.source} onChange={(event) => setVideoForm((current) => ({ ...current, source: event.target.value }))}>
                  <option>YouTube</option>
                  <option>Google Drive</option>
                  <option>Website lain</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="video-linked">Tautkan ke jurnal / materi</Label>
                <Input id="video-linked" value={videoForm.linkedTo} onChange={(event) => setVideoForm((current) => ({ ...current, linkedTo: event.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="video-thumbnail">URL thumbnail video</Label>
              <Input id="video-thumbnail" value={videoForm.thumbnailUrl} onChange={(event) => setVideoForm((current) => ({ ...current, thumbnailUrl: event.target.value }))} />
            </div>
            <div>
              <Label htmlFor="video-thumbnail-file">Upload thumbnail video</Label>
              <Input id="video-thumbnail-file" ref={videoThumbRef} type="file" accept="image/*" onChange={(event) => setVideoThumbnailFile(event.target.files?.[0] || null)} />
            </div>
            <div className="rounded-[24px] border border-border bg-[#fcfaf7] p-4 dark:bg-muted/20">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AppIcon name="video" className="h-4 w-4 text-primary" />
                Preview thumbnail video
              </p>
              <div className="mt-4 h-40 rounded-[20px] bg-cover bg-center" style={{ background: videoPreview }} />
            </div>
            <Button type="button" className="w-full sm:w-fit" onClick={() => handleSave("video")} aria-busy={isPending}>
              {isPending ? "Menyimpan..." : "Simpan video"}
            </Button>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Daftar media tersimpan</p>
          <h2 className="mt-1 text-2xl font-semibold">Preview media terbaru</h2>
          <div className="mt-6 space-y-4">
            {mediaItems.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-[24px] border border-border bg-white dark:bg-card">
                <div className="h-40 bg-cover bg-center" style={{ background: item.thumbnail }} />
                <div className="p-5">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <AppIcon name="media" className="h-4 w-4 text-primary" />
                    {item.title}
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p>Format: {item.format}</p>
                    <p>Ukuran: {item.size}</p>
                    <p>Terhubung ke: {item.linkedTo}</p>
                    <p>Diunggah: {item.uploadedAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Daftar video tersimpan</p>
          <h2 className="mt-1 text-2xl font-semibold">Preview video terbaru</h2>
          <div className="mt-6 space-y-4">
            {videoItems.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-[24px] border border-border bg-white dark:bg-card">
                <div className="h-40 bg-cover bg-center" style={{ background: item.thumbnail }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <AppIcon name="play" className="h-4 w-4 text-primary" />
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.source} - {item.className}
                      </p>
                    </div>
                    <a href={item.videoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-[#fcfaf7] px-3 py-1 text-sm dark:bg-muted/20">
                      Buka link
                    </a>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p>Topik: {item.topic}</p>
                    <p>Terhubung ke: {item.linkedTo}</p>
                    <p>Tanggal: {item.publishedAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
