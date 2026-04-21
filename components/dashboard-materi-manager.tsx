"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { AppIcon } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getClasses, getMaterials, saveMaterial } from "@/lib/api/dashboard";
import type { MaterialItem, MaterialsApiResponse } from "@/lib/api-types";
import { materials } from "@/lib/mock-data";

const fallbackItems: MaterialItem[] = materials.map((material, index) => ({
  id: `${material.title}-${index}`,
  title: material.title,
  type: material.type,
  className: material.className,
  subject: material.subject,
  topic: material.topic,
  meeting: material.meeting,
  updatedAt: material.updatedAt,
  thumbnail: material.thumbnail,
  documentPath: null,
  externalLink: null,
  description: "",
}));

const initialForm = {
  title: "",
  className: "VII-A",
  subject: "Matematika",
  topic: "",
  meeting: "",
  description: "",
  externalLink: "",
  thumbnailUrl: "",
};

export function DashboardMateriManager() {
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const [classOptions, setClassOptions] = useState(["VII-A", "VIII-B", "IX-A"]);
  const [form, setForm] = useState(initialForm);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [items, setItems] = useState<MaterialItem[]>(fallbackItems);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    getClasses({
      className: form.className,
      subject: form.subject,
      search: "",
    })
      .then((response) => {
        if (active) {
          setClassOptions(response.classOptions.length > 0 ? response.classOptions : ["VII-A", "VIII-B", "IX-A"]);
        }
      })
      .catch(() => {
        // Keep fallback class list.
      });

    return () => {
      active = false;
    };
  }, [form.className, form.subject]);

  useEffect(() => {
    let active = true;

    getMaterials()
      .then((response: MaterialsApiResponse) => {
        if (active) {
          setItems(response.items);
        }
      })
      .catch(() => {
        // Keep fallback items.
      });

    return () => {
      active = false;
    };
  }, []);

  const previewBackground = useMemo(() => {
    if (thumbnailFile) {
      return `center / cover no-repeat url("${URL.createObjectURL(thumbnailFile)}")`;
    }

    return form.thumbnailUrl || items[0]?.thumbnail || "#2f8a72";
  }, [form.thumbnailUrl, items, thumbnailFile]);

  const handleSave = (status: "published" | "draft") => {
    setFeedback("");

    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.set(key, value));
        formData.set("status", status);
        if (documentFile) {
          formData.set("documentFile", documentFile);
        }
        if (thumbnailFile) {
          formData.set("thumbnailFile", thumbnailFile);
        }

        const response = await saveMaterial(formData);
        setFeedback(response.message);
        setForm(initialForm);
        setDocumentFile(null);
        setThumbnailFile(null);
        if (documentInputRef.current) {
          documentInputRef.current.value = "";
        }
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = "";
        }
        const latest = await getMaterials();
        setItems(latest.items);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Materi belum dapat disimpan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Kumpulan materi"
        title="Materi dan thumbnail"
        description="Tambahkan materi baru, atur cover thumbnail, lalu tampilkan di halaman depan."
        icon="materi"
        actions={<Button href="/dashboard/media-video">Kelola media & video</Button>}
      />

      {feedback ? (
        <div className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Tambah materi</p>
          <h2 className="mt-1 text-2xl font-semibold">Isi data utama</h2>

          <form className="mt-6 grid gap-4" onSubmit={(event) => event.preventDefault()}>
            <div>
              <Label htmlFor="material-title">Judul materi</Label>
              <Input id="material-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="material-class">Kelas</Label>
                <Select id="material-class" value={form.className} onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))}>
                  {classOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="material-subject">Mata pelajaran</Label>
                <Input id="material-subject" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Contoh: Matematika" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="material-topic">Bab / topik</Label>
                <Input id="material-topic" value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} />
              </div>
              <div>
                <Label htmlFor="material-meeting">Pertemuan</Label>
                <Input id="material-meeting" value={form.meeting} onChange={(event) => setForm((current) => ({ ...current, meeting: event.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="material-description">Deskripsi singkat</Label>
              <Textarea id="material-description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="material-file">Dokumen / file</Label>
                <Input id="material-file" ref={documentInputRef} type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} />
              </div>
              <div>
                <Label htmlFor="material-link">Tautan eksternal</Label>
                <Input id="material-link" value={form.externalLink} onChange={(event) => setForm((current) => ({ ...current, externalLink: event.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="material-thumbnail">URL thumbnail / cover</Label>
                <Input id="material-thumbnail" value={form.thumbnailUrl} onChange={(event) => setForm((current) => ({ ...current, thumbnailUrl: event.target.value }))} />
              </div>
              <div>
                <Label htmlFor="material-thumbnail-file">Upload thumbnail</Label>
                <Input id="material-thumbnail-file" ref={thumbnailInputRef} type="file" accept="image/*" onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-[#fcfaf7] p-4 dark:bg-muted/20">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AppIcon name="media" className="h-4 w-4 text-primary" />
                Preview thumbnail
              </p>
              <div className="mt-4 h-48 rounded-[20px] bg-cover bg-center" style={{ background: previewBackground }} />
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="button" onClick={() => handleSave("published")} aria-busy={isPending}>
                {isPending ? "Menyimpan..." : "Simpan materi"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => handleSave("draft")} aria-busy={isPending}>
                Simpan draft
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Materi tersimpan</p>
          <h2 className="mt-1 text-2xl font-semibold">Daftar cover terbaru</h2>
          <div className="mt-6 space-y-4">
            {items.map((material) => (
              <div key={material.id} className="overflow-hidden rounded-[24px] border border-border bg-white dark:bg-card">
                <div className="h-40 bg-cover bg-center" style={{ background: material.thumbnail }} />
                <div className="p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <AppIcon name="book" className="h-4 w-4 text-primary" />
                        {material.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {material.className} - {material.subject} - {material.topic}
                      </p>
                    </div>
                    <div className="rounded-full border border-border bg-[#fcfaf7] px-3 py-1 text-sm dark:bg-muted/20">
                      {material.type}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Terakhir diperbarui {material.updatedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
