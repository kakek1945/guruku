"use client";

import { useEffect, useState, useTransition } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { deleteAttendance, getAttendance, getClasses, getDashboardSettings, saveAttendance, updateAttendance } from "@/lib/api/dashboard";
import type { AttendanceApiResponse, AttendanceEntry, AttendanceSummaryItem } from "@/lib/api-types";
import { attendanceRecords, attendanceSummary, teacherProfile } from "@/lib/mock-data";
import { getCurrentDateInputValue } from "@/lib/utils";

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
  const [subjectOptions, setSubjectOptions] = useState([teacherProfile.role]);
  const [classOptions, setClassOptions] = useState(["VII-A", "VIII-B", "IX-A"]);
  const [filters, setFilters] = useState({
    attendanceDate: getCurrentDateInputValue(),
    className: "VII-A",
    subject: teacherProfile.role,
    meeting: "Pertemuan 1",
  });
  const [entries, setEntries] = useState<AttendanceEntry[]>(defaultEntries);
  const [summary, setSummary] = useState<AttendanceSummaryItem[]>(defaultSummary);
  const [history, setHistory] = useState<AttendanceApiResponse["history"]>([]);
  const [feedback, setFeedback] = useState("");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  useEffect(() => {
    let active = true;

    getDashboardSettings()
      .then((response) => {
        if (!active) {
          return;
        }

        const nextSubjects = response.profile.subjects.length > 0 ? response.profile.subjects : [teacherProfile.role];
        setSubjectOptions(nextSubjects);
        setFilters((current) => ({
          ...current,
          subject: nextSubjects.includes(current.subject) ? current.subject : nextSubjects[0],
        }));
      })
      .catch(() => {
        // Keep fallback teacher subjects.
      });

    return () => {
      active = false;
    };
  }, []);

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
          setSubjectOptions(response.subjectOptions.length > 0 ? response.subjectOptions : [teacherProfile.role]);
          setFilters((current) => {
            const nextClassName = response.activeClassName || current.className;
            const nextSubject = response.activeSubject || current.subject;

            if (nextClassName === current.className && nextSubject === current.subject) {
              return current;
            }

            return {
              ...current,
              className: nextClassName,
              subject: nextSubject,
            };
          });
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
        setHistory(response.history);
        setActiveRecordId(response.activeRecordId);
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
        const response = activeRecordId
          ? await updateAttendance({
              id: activeRecordId,
              ...filters,
              entries,
            })
          : await saveAttendance({
              ...filters,
              entries,
            });

        setSummary(response.summary);
        setHistory(response.history);
        setActiveRecordId(response.activeRecordId);
        setFeedback(response.message);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Absensi belum dapat disimpan.");
      }
    });
  };

  const handleEdit = (item: AttendanceApiResponse["history"][number]) => {
    setFeedback("");
    setActiveRecordId(item.id);
    setFilters({
      attendanceDate: item.attendanceDate,
      className: item.className,
      subject: item.subject,
      meeting: item.meeting,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setFeedback("");
    setDeletingRecordId(id);

    startDeleting(async () => {
      try {
        const response = await deleteAttendance({ id });
        setHistory(response.history);
        setFeedback(response.message);

        const latest = await getAttendance(filters);
        setEntries(latest.entries);
        setSummary(latest.summary);
        setActiveRecordId(latest.activeRecordId);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Absensi belum dapat dihapus.");
      } finally {
        setDeletingRecordId("");
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
              {subjectOptions.length > 1 ? (
                <Select
                  id="attendance-subject"
                  value={filters.subject}
                  onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))}
                >
                  {subjectOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              ) : (
                <Input id="attendance-subject" value={filters.subject} readOnly />
              )}
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

          {activeRecordId ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setActiveRecordId(null);
                setFilters((current) => ({
                  ...current,
                  attendanceDate: getCurrentDateInputValue(),
                }));
              }}
            >
              Batal edit
            </Button>
          ) : null}
        </div>

        {activeRecordId ? (
          <div className="mt-4 rounded-[20px] border border-[#d6c28f] bg-[#fff8ea] px-4 py-3 text-[13px] text-[#6f5b26] dark:border-[#8e7c4e] dark:bg-[#2b271e] dark:text-[#eadba9]">
            Mode edit aktif. Saat disimpan, data absensi yang dipilih akan diperbarui.
          </div>
        ) : null}
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
              {isPending ? "Menyimpan..." : activeRecordId ? "Perbarui absensi" : "Simpan absensi"}
            </Button>
          </div>

          <div className="mt-6 max-h-[58rem] space-y-4 overflow-y-auto pr-2">
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

      <Card className="p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Riwayat absensi</p>
            <h2 className="mt-1 text-2xl font-semibold">Absensi terbaru</h2>
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
            {history.length} sesi
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {history.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-border bg-[#fcfaf7] p-5 dark:bg-muted/20">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {item.attendanceDate} - {item.className} - {item.subject}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{item.meeting}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.total} siswa tercatat pada sesi ini.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[#a24a35] hover:bg-[#fff1ec] hover:text-[#8d3d2a] dark:text-[#f0b8aa] dark:hover:bg-[#36201a]"
                    onClick={() => handleDelete(item.id)}
                    aria-busy={isDeleting}
                  >
                    {isDeleting && deletingRecordId === item.id ? "Menghapus..." : "Hapus"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
