"use client";

import { useEffect, useState, useTransition } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getAttendance, getClasses, saveAttendance } from "@/lib/api/dashboard";
import type { AttendanceApiResponse, AttendanceEntry, AttendanceSummaryItem } from "@/lib/api-types";
import { attendanceRecords, attendanceSummary } from "@/lib/mock-data";

const statusOptions = [
  { code: "H", label: "Hadir" },
  { code: "S", label: "Sakit" },
  { code: "I", label: "Izin" },
  { code: "A", label: "Alpha" },
];

const defaultEntries: AttendanceEntry[] = attendanceRecords.map((item) => ({
  name: item.name,
  nis: item.nis,
  status: item.status,
  note: item.note,
}));

const defaultSummary: AttendanceSummaryItem[] = attendanceSummary.map((item) => ({
  label: item.label,
  value: item.value,
  description: item.description,
}));

export function DashboardAbsensiForm() {
  const [classOptions, setClassOptions] = useState(["VII-A", "VIII-B", "IX-A"]);
  const [filters, setFilters] = useState({
    attendanceDate: "2026-04-20",
    className: "VII-A",
    subject: "Matematika",
    meeting: "Pertemuan 1",
  });
  const [entries, setEntries] = useState<AttendanceEntry[]>(defaultEntries);
  const [summary, setSummary] = useState<AttendanceSummaryItem[]>(defaultSummary);
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

    getAttendance(filters)
      .then((response: AttendanceApiResponse) => {
        if (!active) {
          return;
        }

        setEntries(response.entries);
        setSummary(response.summary);
      })
      .catch(() => {
        // Keep fallback data.
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const handleStatusChange = (nis: string, status: string) => {
    setEntries((current) =>
      current.map((entry) => (entry.nis === nis ? { ...entry, status } : entry)),
    );
  };

  const handleSave = () => {
    setFeedback("");

    startTransition(async () => {
      try {
        const response = await saveAttendance({
          ...filters,
          entries,
        });

        setSummary(response.summary);
        setFeedback(response.message);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Absensi belum dapat disimpan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Absensi siswa"
        title="Input kehadiran satu kelas sekaligus"
        description="Pilih tanggal dan kelas, lalu tandai status setiap siswa tanpa berpindah konteks."
        icon="absensi"
        actions={<Button href="/dashboard/nilai">Lanjut ke nilai</Button>}
      />

      {feedback ? (
        <div className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      <Card className="p-6 md:p-7">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="attendance-date">Tanggal</Label>
            <Input
              id="attendance-date"
              type="date"
              value={filters.attendanceDate}
              onChange={(event) => setFilters((current) => ({ ...current, attendanceDate: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="attendance-class">Kelas</Label>
            <Select
              id="attendance-class"
              value={filters.className}
              onChange={(event) => setFilters((current) => ({ ...current, className: event.target.value }))}
            >
              {classOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="attendance-subject">Mata pelajaran</Label>
            <Input
              id="attendance-subject"
              value={filters.subject}
              placeholder="Contoh: Matematika"
              onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="attendance-meeting">Pertemuan</Label>
            <Input
              id="attendance-meeting"
              value={filters.meeting}
              placeholder="Contoh: Pertemuan 5"
              onChange={(event) => setFilters((current) => ({ ...current, meeting: event.target.value }))}
            />
          </div>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Rekap hari ini</p>
          <h2 className="mt-1 text-2xl font-semibold">Status kehadiran {filters.className}</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-white px-3 py-1 dark:bg-card">H = Hadir</span>
            <span className="rounded-full border border-border bg-white px-3 py-1 dark:bg-card">S = Sakit</span>
            <span className="rounded-full border border-border bg-white px-3 py-1 dark:bg-card">I = Izin</span>
            <span className="rounded-full border border-border bg-white px-3 py-1 dark:bg-card">A = Alpha</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {summary.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-border bg-[#fcfaf7] p-5 dark:bg-muted/20">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Input per siswa</p>
              <h2 className="mt-1 text-2xl font-semibold">Daftar kehadiran</h2>
            </div>
            <Button type="button" variant="ghost" onClick={handleSave} aria-busy={isPending}>
              {isPending ? "Menyimpan..." : "Simpan absensi"}
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {entries.map((student) => (
              <div key={student.nis} className="rounded-[24px] border border-border bg-white p-4 dark:bg-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      NIS {student.nis} - {student.note}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => {
                      const active = status.code === student.status;
                      return (
                        <button
                          key={status.code}
                          type="button"
                          onClick={() => handleStatusChange(student.nis, status.code)}
                          className={`rounded-full px-4 py-2 text-sm transition ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-[#fcfaf7] text-foreground dark:bg-muted/20"
                          }`}
                          title={status.label}
                        >
                          {status.code}
                        </button>
                      );
                    })}
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
