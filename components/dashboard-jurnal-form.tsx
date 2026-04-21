"use client";

import { useEffect, useState, useTransition } from "react";

import { AppIcon } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getClasses, getDashboardSettings, getJournals, saveJournal } from "@/lib/api/dashboard";
import type { DashboardSettingsProfile, JournalHistoryItem, JournalsApiResponse } from "@/lib/api-types";
import { journalHistory, teacherProfile } from "@/lib/mock-data";

const defaultHistory: JournalHistoryItem[] = journalHistory.map((entry, index) => ({
  id: `${entry.date}-${entry.className}-${index}`,
  date: entry.date,
  className: entry.className,
  subject: entry.subject,
  hours: entry.hours,
  topic: entry.topic,
  goal: entry.goal,
  activity: entry.activity,
  note: entry.note,
  status: "published",
  entryDate: "2026-04-19",
}));

const initialForm = {
  entryDate: "2026-04-20",
  hours: "",
  className: "VII-A",
  subject: "Matematika",
  topic: "",
  goal: "",
  activity: "",
  note: "",
};

const initialReportFilters = {
  mode: "range",
  fromDate: "2026-04-01",
  toDate: "2026-04-20",
  month: "2026-04",
  className: "VII-A",
};

function formatReportPeriod(filters: typeof initialReportFilters) {
  if (filters.mode === "month") {
    return `Bulan ${filters.month}`;
  }

  return `${filters.fromDate} s.d. ${filters.toDate}`;
}

function wrapPdfText(text: string, maxWidth: number, font: { widthOfTextAtSize(text: string, size: number): number }, fontSize: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

export function DashboardJurnalForm() {
  const [form, setForm] = useState(initialForm);
  const [history, setHistory] = useState<JournalHistoryItem[]>(defaultHistory);
  const [profile, setProfile] = useState<DashboardSettingsProfile>({
    name: teacherProfile.name,
    role: teacherProfile.role,
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
  const [classOptions, setClassOptions] = useState(["VII-A", "VIII-B", "IX-A"]);
  const [reportFilters, setReportFilters] = useState(initialReportFilters);
  const [feedback, setFeedback] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExporting] = useTransition();

  const fetchHistory = async (filters?: Partial<typeof initialReportFilters>) => {
    const activeFilters = {
      ...reportFilters,
      ...filters,
    };
    const searchParams: Record<string, string> =
      activeFilters.mode === "month"
        ? { month: activeFilters.month }
        : {
            fromDate: activeFilters.fromDate,
            toDate: activeFilters.toDate,
          };

    if (activeFilters.className) {
      searchParams.className = activeFilters.className;
    }

    const response = await getJournals(searchParams);
    setHistory(response.history);
    return response.history;
  };

  useEffect(() => {
    let active = true;

    getJournals()
      .then((response: JournalsApiResponse) => {
        if (active) {
          setHistory(response.history);
        }
      })
      .catch(() => {
        // Keep fallback history.
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
        // Keep fallback teacher profile.
      });

    return () => {
      active = false;
    };
  }, []);

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

  const handleChange = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    if (key === "className") {
      setReportFilters((current) => ({
        ...current,
        className: value,
      }));
    }
  };

  const handleReportChange = (key: keyof typeof initialReportFilters, value: string) => {
    setReportFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleApplyReport = () => {
    setFeedback("");

    startExporting(async () => {
      try {
        const filteredHistory = await fetchHistory();
        setFeedback(`Rekap jurnal ditemukan: ${filteredHistory.length} entri.`);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Rekap jurnal belum dapat dimuat.");
      }
    });
  };

  const handleDownloadReport = () => {
    setFeedback("");

    startExporting(async () => {
      try {
        const filteredHistory = await fetchHistory();

        if (filteredHistory.length === 0) {
          setFeedback("Belum ada jurnal pada filter rekap yang dipilih.");
          return;
        }

        const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
        const pdfDoc = await PDFDocument.create();
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const marginX = 42;
        const topY = 800;
        const contentWidth = pageWidth - marginX * 2;
        const lineHeight = 14;
        const sectionGap = 8;
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = topY;

        const addNewPage = () => {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = topY;
        };

        const ensureSpace = (neededHeight: number) => {
          if (y - neededHeight < 50) {
            addNewPage();
          }
        };

        page.drawText("Rekap Jurnal Guru", {
          x: marginX,
          y,
          size: 21,
          font: boldFont,
          color: rgb(0.09, 0.22, 0.19),
        });
        y -= 28;

        page.drawRectangle({
          x: marginX,
          y: y - 58,
          width: contentWidth,
          height: 58,
          borderWidth: 1,
          borderColor: rgb(0.86, 0.82, 0.74),
          color: rgb(0.99, 0.98, 0.95),
        });

        page.drawText(`Sekolah: ${profile.school}`, {
          x: marginX + 14,
          y: y - 18,
          size: 10.5,
          font: regularFont,
          color: rgb(0.28, 0.36, 0.33),
        });
        page.drawText(`Guru: ${profile.name}`, {
          x: marginX + 14,
          y: y - 33,
          size: 10.5,
          font: regularFont,
          color: rgb(0.28, 0.36, 0.33),
        });
        page.drawText(`Periode: ${formatReportPeriod(reportFilters)}`, {
          x: marginX + 14,
          y: y - 48,
          size: 10.5,
          font: regularFont,
          color: rgb(0.28, 0.36, 0.33),
        });
        if (reportFilters.className) {
          page.drawText(`Kelas: ${reportFilters.className}`, {
            x: marginX + 250,
            y: y - 48,
            size: 10.5,
            font: regularFont,
            color: rgb(0.28, 0.36, 0.33),
          });
        }
        y -= 78;

        for (const entry of filteredHistory) {
          const topicLines = wrapPdfText(entry.topic, contentWidth - 28, boldFont, 12.5);
          const goalLines = wrapPdfText(`Tujuan: ${entry.goal}`, contentWidth - 28, regularFont, 10.5);
          const activityLines = wrapPdfText(`Aktivitas: ${entry.activity}`, contentWidth - 28, regularFont, 10.5);
          const noteLines = wrapPdfText(`Catatan: ${entry.note}`, contentWidth - 28, regularFont, 10.5);
          const headerHeight = 18 + topicLines.length * 15;
          const bodyLines = goalLines.length + activityLines.length + noteLines.length;
          const blockHeight = headerHeight + bodyLines * lineHeight + sectionGap * 3 + 26;

          ensureSpace(blockHeight);

          page.drawRectangle({
            x: marginX,
            y: y - blockHeight + 10,
            width: contentWidth,
            height: blockHeight,
            borderWidth: 1,
            borderColor: rgb(0.90, 0.86, 0.78),
            color: rgb(1, 1, 1),
          });

          page.drawText(`${entry.date}  |  ${entry.className}  |  ${entry.subject}  |  ${entry.hours}`, {
            x: marginX + 14,
            y: y - 16,
            size: 9.5,
            font: regularFont,
            color: rgb(0.42, 0.48, 0.45),
          });

          let textY = y - 37;
          topicLines.forEach((line) => {
            page.drawText(line, {
              x: marginX + 14,
              y: textY,
              size: 12.5,
              font: boldFont,
              color: rgb(0.09, 0.22, 0.19),
            });
            textY -= 15;
          });

          textY -= 3;

          [...goalLines, "", ...activityLines, "", ...noteLines].forEach((line) => {
            if (!line) {
              textY -= sectionGap;
              return;
            }

            page.drawText(line, {
              x: marginX + 14,
              y: textY,
              size: 10.5,
              font: regularFont,
              color: rgb(0.24, 0.30, 0.28),
            });
            textY -= lineHeight;
          });

          y -= blockHeight + 14;
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const fileSuffix =
          reportFilters.mode === "month"
            ? `bulan-${reportFilters.month}`
            : `${reportFilters.fromDate}_${reportFilters.toDate}`;

        link.href = url;
        link.download = `rekap-jurnal-${fileSuffix}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        setFeedback("Rekap jurnal PDF berhasil diunduh.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Rekap jurnal PDF belum dapat diunduh.");
      }
    });
  };

  const handlePrintReport = () => {
    setFeedback("");

    startExporting(async () => {
      try {
        const filteredHistory = await fetchHistory();

        if (filteredHistory.length === 0) {
          setFeedback("Belum ada jurnal pada filter rekap yang dipilih.");
          return;
        }

        const printWindow = window.open("", "_blank", "width=1080,height=760");

        if (!printWindow) {
          setFeedback("Jendela print diblokir browser.");
          return;
        }

        const rows = filteredHistory
          .map(
            (entry) => `
              <tr>
                <td>${entry.date}</td>
                <td>${entry.className}</td>
                <td>${entry.subject}</td>
                <td>${entry.hours}</td>
                <td>${entry.topic}</td>
                <td>${entry.goal}</td>
                <td>${entry.activity}</td>
                <td>${entry.note}</td>
              </tr>
            `,
          )
          .join("");

        printWindow.document.write(`
          <html>
            <head>
              <title>Rekap Jurnal Guru</title>
              <style>
                body { font-family: Georgia, 'Times New Roman', serif; margin: 32px; color: #1b2b26; }
                h1 { margin: 0 0 6px; font-size: 26px; }
                p { margin: 0 0 6px; font-size: 13px; color: #4f625b; }
                .meta { margin-bottom: 20px; padding: 16px 18px; border: 1px solid #d8d0bf; border-radius: 16px; background: #fdfaf3; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #d8d0bf; padding: 10px 9px; vertical-align: top; text-align: left; }
                th { background: #114f43; color: #ffffff; font-weight: 600; }
                tr:nth-child(even) td { background: #fbf8f1; }
              </style>
            </head>
            <body>
              <h1>Rekap Jurnal Guru</h1>
              <div class="meta">
                <p><strong>Sekolah:</strong> ${profile.school}</p>
                <p><strong>Guru:</strong> ${profile.name}</p>
                <p><strong>Periode:</strong> ${formatReportPeriod(reportFilters)}</p>
                <p><strong>Kelas:</strong> ${reportFilters.className || "Semua kelas"}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kelas</th>
                    <th>Mata Pelajaran</th>
                    <th>Jam</th>
                    <th>Materi</th>
                    <th>Tujuan</th>
                    <th>Aktivitas</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();

        setFeedback("Rekap jurnal siap dicetak.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Rekap jurnal belum dapat dicetak.");
      }
    });
  };

  const handleSubmit = (status: "published" | "draft") => {
    setFeedback("");

    startTransition(async () => {
      try {
        const response = await saveJournal({
          ...form,
          status,
        });

        setHistory(response.history);
        setFeedback(response.message);
        if (status === "published") {
          setForm((current) => ({
            ...initialForm,
            className: current.className,
            subject: current.subject,
          }));
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Jurnal belum dapat disimpan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Jurnal harian guru"
        title="Input jurnal per pertemuan"
        description="Semua kolom inti pada PRD tersedia di satu form yang ringkas agar guru bisa mencatat kegiatan kelas dengan cepat."
        icon="jurnal"
        actions={
          <>
            <Button href="/dashboard">Dashboard</Button>
            <Button href="#riwayat-jurnal" variant="ghost">
              Lihat riwayat
            </Button>
          </>
        }
      />

      {feedback ? (
        <div className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6 md:p-7">
          <p className="text-sm text-muted-foreground">Form input cepat</p>
          <h2 className="mt-1 text-2xl font-semibold">Isi jurnal mengajar harian</h2>

          <form className="mt-6 grid gap-4" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={form.entryDate}
                  onChange={(event) => handleChange("entryDate", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jam">Jam pelajaran</Label>
                <Input
                  id="jam"
                  placeholder="Contoh: 07.15 - 08.35"
                  value={form.hours}
                  onChange={(event) => handleChange("hours", event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="kelas">Kelas</Label>
                <Select id="kelas" value={form.className} onChange={(event) => handleChange("className", event.target.value)}>
                  {classOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="mapel">Mata pelajaran</Label>
                <Input id="mapel" value={form.subject} onChange={(event) => handleChange("subject", event.target.value)} placeholder="Contoh: Matematika" />
              </div>
            </div>

            <div>
              <Label htmlFor="materi">Materi yang diajarkan</Label>
              <Input id="materi" value={form.topic} onChange={(event) => handleChange("topic", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="tujuan">Tujuan / kompetensi</Label>
              <Textarea id="tujuan" value={form.goal} onChange={(event) => handleChange("goal", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="aktivitas">Aktivitas pembelajaran</Label>
              <Textarea id="aktivitas" value={form.activity} onChange={(event) => handleChange("activity", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="catatan">Catatan kendala / evaluasi</Label>
              <Textarea id="catatan" value={form.note} onChange={(event) => handleChange("note", event.target.value)} />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="button" onClick={() => handleSubmit("published")} aria-busy={isPending}>
                {isPending ? "Menyimpan..." : "Simpan jurnal"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => handleSubmit("draft")} aria-busy={isPending}>
                Simpan sebagai draft
              </Button>
            </div>
          </form>
        </Card>

        <Card id="riwayat-jurnal" className="p-6 md:p-7">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-muted-foreground">Riwayat jurnal</p>
              <h2 className="mt-1 text-2xl font-semibold">Jurnal terbaru tersimpan</h2>
            </div>

            <div className="rounded-[26px] border border-[#e5dcc8] bg-[#fffdf8] p-5 dark:border-border dark:bg-muted/20">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <AppIcon name="calendar" className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Rekap jurnal</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Pilih rekap berdasarkan rentang tanggal atau per bulan, lalu unduh PDF atau cetak langsung.
                  </p>
                </div>
                <Badge>{history.length} entri</Badge>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr_180px] md:items-end">
                <div>
                  <Label htmlFor="report-mode">Jenis rekap</Label>
                  <Select
                    id="report-mode"
                    value={reportFilters.mode}
                    onChange={(event) => handleReportChange("mode", event.target.value)}
                  >
                    <option value="range">Dari tanggal</option>
                    <option value="month">Per bulan</option>
                  </Select>
                </div>

                <div className="md:order-3">
                  <Label htmlFor="report-class">Kelas</Label>
                  <Select
                    id="report-class"
                    value={reportFilters.className}
                    onChange={(event) => handleReportChange("className", event.target.value)}
                  >
                    {classOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </div>

                {reportFilters.mode === "month" ? (
                  <div className="md:order-2">
                    <Label htmlFor="report-month">Bulan</Label>
                    <Input
                      id="report-month"
                      type="month"
                      value={reportFilters.month}
                      onChange={(event) => handleReportChange("month", event.target.value)}
                    />
                  </div>
                ) : (
                  <div className="grid gap-3 md:order-2 md:grid-cols-[1fr_auto_1fr] md:items-end">
                    <div>
                      <Label htmlFor="report-from">Dari tanggal</Label>
                      <Input
                        id="report-from"
                        type="date"
                        value={reportFilters.fromDate}
                        onChange={(event) => handleReportChange("fromDate", event.target.value)}
                      />
                    </div>
                    <div className="flex h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      sampai
                    </div>
                    <div>
                      <Label htmlFor="report-to">Sampai tanggal</Label>
                      <Input
                        id="report-to"
                        type="date"
                        value={reportFilters.toDate}
                        onChange={(event) => handleReportChange("toDate", event.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="ghost" onClick={handleApplyReport} aria-busy={isExporting}>
                  {isExporting ? "Memuat..." : "Tampilkan rekap"}
                </Button>
                <Button type="button" onClick={handleDownloadReport} aria-busy={isExporting}>
                  Download PDF
                </Button>
                <Button type="button" variant="ghost" onClick={handlePrintReport} aria-busy={isExporting}>
                  Print rekap
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="rounded-[24px] border border-border bg-[#fcfaf7] p-5 dark:bg-muted/20">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {entry.date} - {entry.className} - {entry.subject} - {entry.hours}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{entry.topic}</h3>
                  </div>
                  <div className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
                    {entry.status === "draft" ? "Draft" : "Tersimpan"}
                  </div>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Tujuan:</span> {entry.goal}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Aktivitas:</span> {entry.activity}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Catatan:</span> {entry.note}
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
