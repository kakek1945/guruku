"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { AppIcon } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { deleteClass, getClasses, importDashboardStudents } from "@/lib/api/dashboard";
import type { ClassesApiResponse } from "@/lib/api-types";
import { academicFilters, classAssignments, studentCsvTemplateColumns, studentRoster } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const defaultData: ClassesApiResponse = {
  filters: academicFilters,
  classOptions: ["VII-A", "VIII-B", "IX-A"],
  classAssignments,
  roster: studentRoster,
};

function buildTemplateCsv() {
  return `\uFEFF${studentCsvTemplateColumns.join(",")}\r\n`;
}

export function DashboardKelasView() {
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const [filters, setFilters] = useState({
    schoolYear: academicFilters.schoolYear,
    semester: academicFilters.semester,
    className: "VII-A",
    search: "",
  });
  const [data, setData] = useState<ClassesApiResponse>(defaultData);
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [deletingClassName, setDeletingClassName] = useState("");
  const [isImporting, startImporting] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  useEffect(() => {
    let active = true;

    getClasses({
      className: filters.className,
      subject: "",
      search: filters.search,
      schoolYear: filters.schoolYear,
      semester: filters.semester,
    })
      .then((response) => {
        if (!active) {
          return;
        }

        setData(response);
        if (!response.classOptions.includes(filters.className) && response.classOptions[0]) {
          setFilters((current) => ({ ...current, className: response.classOptions[0] }));
        }
      })
      .catch(() => {
        // Keep fallback view when API is unavailable.
      });

    return () => {
      active = false;
    };
  }, [filters.className, filters.search, filters.schoolYear, filters.semester]);

  const handleDownloadTemplate = () => {
    const blob = new Blob([buildTemplateCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "template-siswa-guruku.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!selectedCsvFile) {
      setFeedback({
        tone: "error",
        message: "Pilih file CSV siswa terlebih dahulu.",
      });
      return;
    }

    setFeedback(null);

    startImporting(async () => {
      const formData = new FormData();
      formData.set("studentCsv", selectedCsvFile);
      formData.set("schoolYear", filters.schoolYear);
      formData.set("semester", filters.semester);

      try {
        const response = await importDashboardStudents(formData);
        setFeedback({
          tone: "success",
          message: response.message,
        });
        setSelectedCsvFile(null);
        if (csvInputRef.current) {
          csvInputRef.current.value = "";
        }

        const nextClassName = response.importedClasses[0] || filters.className;

        const latest = await getClasses({
          className: nextClassName,
          subject: "",
          search: filters.search,
          schoolYear: filters.schoolYear,
          semester: filters.semester,
        });

        setData(latest);
        setFilters((current) => ({
          ...current,
          className: latest.classOptions.includes(nextClassName)
            ? nextClassName
            : latest.classOptions[0] || "",
        }));
      } catch (error) {
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Data siswa belum dapat diimpor.",
        });
      }
    });
  };

  const handleDeleteClass = (className: string) => {
    setFeedback(null);
    setDeletingClassName(className);

    startDeleting(async () => {
      try {
        const response = await deleteClass({
          className,
          schoolYear: filters.schoolYear,
          semester: filters.semester,
        });

        setFeedback({
          tone: "success",
          message: response.message,
        });

        const nextClassName =
          filters.className === className
            ? response.classOptions[0] || ""
            : filters.className;

        const latest = await getClasses({
          className: nextClassName,
          subject: "",
          search: filters.search,
          schoolYear: filters.schoolYear,
          semester: filters.semester,
        });

        setData(latest);
        setFilters((current) => ({
          ...current,
          className: nextClassName || latest.classOptions[0] || "",
        }));
      } catch (error) {
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Kelas belum dapat dihapus.",
        });
      } finally {
        setDeletingClassName("");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Data kelas"
        title="Upload siswa dan baca kelas otomatis"
        description="Cukup import file siswa. Sistem akan membaca daftar kelas yang diajar dan nama siswa yang terdaftar."
        icon="kelas"
        actions={<Button href="/dashboard">Kembali ke dashboard</Button>}
      />

      {feedback ? (
        <div
          className={`rounded-[20px] border px-4 py-3 text-[13px] ${
            feedback.tone === "success"
              ? "border-[#cfe6da] bg-[#f6fbf8] text-[#1f6d59] dark:border-[#28584e] dark:bg-[#163a34] dark:text-[#d4efe6]"
              : "border-[#eed2c9] bg-[#fff6f3] text-[#a24a35] dark:border-[#6a3829] dark:bg-[#2d1813] dark:text-[#f3d0c5]"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <Card className="p-5">
        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[20px] border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[18px] bg-secondary text-primary">
                <AppIcon name="upload" className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[13px] font-medium">Upload data siswa</p>
                <p className="text-[13px] text-muted-foreground">Import sekali, lalu kelas akan muncul otomatis.</p>
              </div>
            </div>

            <Label htmlFor="student-csv" className="mt-4 block">
              Pilih file CSV
            </Label>
            <Input
              id="student-csv"
              ref={csvInputRef}
              className="mt-2"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setSelectedCsvFile(event.target.files?.[0] || null)}
            />

            <p className="mt-3 text-xs text-muted-foreground">
              {selectedCsvFile ? `File terpilih: ${selectedCsvFile.name}` : "Belum ada file yang dipilih."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={handleDownloadTemplate}>
                Download template
              </Button>
              <Button type="button" onClick={handleImport} aria-busy={isImporting}>
                {isImporting ? "Mengimpor..." : "Import siswa"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-border bg-[#fcfaf7] p-4 dark:bg-muted/20">
              <p className="text-[13px] text-muted-foreground">Jumlah kelas</p>
              <p className="mt-2 text-[1.55rem] font-semibold leading-none">{data.classOptions.length}</p>
            </div>
            <div className="rounded-[20px] border border-border bg-[#fcfaf7] p-4 dark:bg-muted/20">
              <p className="text-[13px] text-muted-foreground">Kelas aktif</p>
              <p className="mt-2 text-[1.1rem] font-semibold leading-none">{filters.className || "-"}</p>
            </div>
            <div className="rounded-[20px] border border-border bg-[#fcfaf7] p-4 dark:bg-muted/20">
              <p className="text-[13px] text-muted-foreground">Jumlah siswa</p>
              <p className="mt-2 text-[1.55rem] font-semibold leading-none">{data.roster.length}</p>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] text-muted-foreground">Daftar kelas dari import</p>
              <h2 className="mt-1 text-[1.35rem] font-semibold">Kelas yang terbaca</h2>
            </div>
            <div className="w-full max-w-[150px]">
              <Label htmlFor="class-filter">Kelas</Label>
              <Select
                id="class-filter"
                value={filters.className}
                onChange={(event) => setFilters((current) => ({ ...current, className: event.target.value }))}
              >
                {data.classOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {data.classAssignments.map((item) => (
              <div
                key={item.className}
                className={cn(
                  "grid gap-3 rounded-[20px] border p-4 transition",
                  item.className === filters.className
                    ? "border-[#d6c28f] bg-[#fff8ea] dark:border-[#8e7c4e] dark:bg-[#2b271e]"
                    : "border-border bg-white dark:bg-card",
                )}
              >
                <button
                  type="button"
                  onClick={() => setFilters((current) => ({ ...current, className: item.className }))}
                  className="grid gap-2 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[1rem] font-semibold">{item.className}</p>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
                      {item.students} siswa
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground">{item.subject}</p>
                </button>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-3 text-[12px] text-[#a24a35] hover:bg-[#fff1ec] hover:text-[#8d3d2a] dark:text-[#f0b8aa] dark:hover:bg-[#36201a]"
                    onClick={() => handleDeleteClass(item.className)}
                    aria-busy={isDeleting}
                  >
                    {isDeleting && deletingClassName === item.className ? "Menghapus..." : "Hapus"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Daftar siswa terdaftar</p>
              <h2 className="mt-1 text-[1.35rem] font-semibold">Roster {filters.className}</h2>
            </div>
            <div className="w-full sm:max-w-xs">
              <Label htmlFor="student-search">Cari siswa</Label>
              <Input
                id="student-search"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Cari nama atau NIS"
              />
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {data.roster.map((student) => (
              <div key={student.nis} className="flex items-center justify-between rounded-[18px] border border-border bg-white px-4 py-3 dark:bg-card">
                <div>
                  <p className="text-[13px] font-medium text-foreground">{student.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    NIS {student.nis} - {student.className}
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
