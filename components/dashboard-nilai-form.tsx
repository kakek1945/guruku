"use client";

import { useEffect, useState, useTransition } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getClasses, getScores, saveScores } from "@/lib/api/dashboard";
import type { ScoreEntry, ScoreHistoryItem, ScoresApiResponse } from "@/lib/api-types";
import { scoreEntries, scoreHistory, scoreTypes } from "@/lib/mock-data";

const defaultEntries: ScoreEntry[] = scoreEntries.map((entry, index) => ({
  name: entry.name,
  nis: `mock-${index}`,
  score: entry.score,
  status: entry.status,
}));

const defaultHistory: ScoreHistoryItem[] = scoreHistory.map((item, index) => ({
  id: `${item.date}-${index}`,
  date: item.date,
  type: item.type,
  className: item.className,
  topic: item.topic,
  average: item.average,
}));

export function DashboardNilaiForm() {
  const [classOptions, setClassOptions] = useState(["VII-A", "VIII-B", "IX-A"]);
  const [filters, setFilters] = useState({
    className: "VII-A",
    subject: "Matematika",
    scoreType: scoreTypes[1],
    meeting: "Pertemuan 4 - Persamaan Linear",
    scoreDate: "2026-04-20",
  });
  const [entries, setEntries] = useState<ScoreEntry[]>(defaultEntries);
  const [history, setHistory] = useState<ScoreHistoryItem[]>(defaultHistory);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    getClasses({
      className: filters.className,
      subject: filters.subject,
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
  }, [filters.className, filters.subject]);

  useEffect(() => {
    let active = true;

    getScores(filters)
      .then((response: ScoresApiResponse) => {
        if (!active) {
          return;
        }

        setEntries(response.entries);
        setHistory(response.history);
      })
      .catch(() => {
        // Keep fallback.
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const handleEntryChange = (nis: string, key: "score" | "status", value: string) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.nis === nis
          ? {
              ...entry,
              [key]: key === "score" ? Number(value || 0) : value,
            }
          : entry,
      ),
    );
  };

  const handleSave = () => {
    setFeedback("");

    startTransition(async () => {
      try {
        const response = await saveScores({
          ...filters,
          entries,
        });

        setFeedback(response.message);
        const updated = await getScores(filters);
        setHistory(updated.history);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Nilai belum dapat disimpan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Nilai harian siswa"
        title="Input nilai berdasarkan jenis penilaian"
        description="Guru memilih jenis penilaian, kelas, dan topik, lalu mengisi skor tiap siswa dengan riwayat yang tetap mudah dibaca."
        icon="nilai"
        actions={<Button href="/dashboard/materi">Buka materi</Button>}
      />

      {feedback ? (
        <div className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      <Card className="p-6 md:p-7">
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <Label htmlFor="score-class">Kelas</Label>
            <Select id="score-class" value={filters.className} onChange={(event) => setFilters((current) => ({ ...current, className: event.target.value }))}>
              {classOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="score-subject">Mata pelajaran</Label>
            <Input id="score-subject" value={filters.subject} onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))} placeholder="Contoh: Matematika" />
          </div>
          <div>
            <Label htmlFor="score-type">Jenis penilaian</Label>
            <Select id="score-type" value={filters.scoreType} onChange={(event) => setFilters((current) => ({ ...current, scoreType: event.target.value }))}>
              {scoreTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="score-meeting">Pertemuan / topik</Label>
            <Input id="score-meeting" value={filters.meeting} onChange={(event) => setFilters((current) => ({ ...current, meeting: event.target.value }))} />
          </div>
          <div>
            <Label htmlFor="score-date">Tanggal</Label>
            <Input id="score-date" type="date" value={filters.scoreDate} onChange={(event) => setFilters((current) => ({ ...current, scoreDate: event.target.value }))} />
          </div>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Input skor per siswa</p>
              <h2 className="mt-1 text-2xl font-semibold">Daftar nilai {filters.className}</h2>
            </div>
            <Button type="button" variant="ghost" onClick={handleSave} aria-busy={isPending}>
              {isPending ? "Menyimpan..." : "Simpan nilai"}
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.nis}
                className="grid gap-3 rounded-[24px] border border-border bg-white p-4 md:grid-cols-[1fr_120px_180px] dark:bg-card"
              >
                <div>
                  <p className="font-medium text-foreground">{entry.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.status}</p>
                </div>
                <Input
                  value={String(entry.score)}
                  inputMode="numeric"
                  onChange={(event) => handleEntryChange(entry.nis, "score", event.target.value)}
                />
                <Select value={entry.status} onChange={(event) => handleEntryChange(entry.nis, "status", event.target.value)}>
                  <option>Tuntas</option>
                  <option>Perlu tindak lanjut</option>
                  <option>Remedial</option>
                </Select>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Riwayat nilai</p>
          <h2 className="mt-1 text-2xl font-semibold">Input terbaru dan rata-rata kelas</h2>
          <div className="mt-6 space-y-4">
            {history.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-border bg-[#fcfaf7] p-5 dark:bg-muted/20">
                <p className="text-sm text-muted-foreground">{item.date}</p>
                <h3 className="mt-2 text-lg font-semibold">
                  {item.type} - {item.className}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.topic}</p>
                <p className="mt-4 text-3xl font-semibold">{item.average}</p>
                <p className="text-sm text-muted-foreground">Rata-rata kelas</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
