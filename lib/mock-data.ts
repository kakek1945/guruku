function createThumbnail(bg: string, _accent: string) {
  return bg;
}

export const teacherProfile = {
  name: "Admin GuruKu",
  role: "Administrator",
  school: "SMP Negeri Kep. Meranti",
  nip: "",
  email: "admin@guruku",
  phone: "",
  address: "",
  announcementTitle: "Pengumuman guru",
  announcementBody: "Belum ada pengumuman.",
};

export const academicFilters = {
  schoolYear: "2025/2026",
  semester: "Genap",
};

export const quickActions = [
  {
    title: "Isi jurnal harian",
    description: "Catat materi, tujuan, aktivitas, dan evaluasi per pertemuan.",
    href: "/dashboard/jurnal",
    accent: "bg-[#2d8a71]",
  },
  {
    title: "Input absensi",
    description: "Tandai hadir, izin, sakit, atau alpha untuk satu kelas sekaligus.",
    href: "/dashboard/absensi",
    accent: "bg-[#3b9d83]",
  },
  {
    title: "Input nilai",
    description: "Masukkan nilai tugas, quiz, praktik, atau observasi dengan cepat.",
    href: "/dashboard/nilai",
    accent: "bg-[#78b6a0]",
  },
  {
    title: "Tambah materi",
    description: "Unggah dokumen, tautan, media, dan video pembelajaran terstruktur.",
    href: "/dashboard/materi",
    accent: "bg-[#ddb25a]",
  },
];

export const dashboardMetrics = [
  { label: "Data siswa", value: "0 siswa", note: "Belum ada data siswa yang tersimpan." },
  { label: "Jurnal tersimpan", value: "0", note: "Belum ada jurnal yang tersimpan." },
  { label: "Absensi masuk", value: "0", note: "Belum ada absensi yang tercatat." },
  { label: "Nilai terbaru", value: "0", note: "Belum ada nilai yang tersimpan." },
];

export const scheduleToday: Array<{
  time: string;
  className: string;
  subject: string;
  topic: string;
  status: string;
}> = [];

export const classAssignments: Array<{
  className: string;
  subject: string;
  students: number;
  journalProgress: string;
  latestTopic: string;
}> = [];

export const studentRoster: Array<{ name: string; nis: string; className: string }> = [];

export const studentCsvTemplateColumns = ["nis", "nama_siswa", "kelas", "jenis_kelamin"];

export const studentCsvTemplateRows: string[][] = [];

export const journalHistory: Array<{
  date: string;
  className: string;
  subject: string;
  hours: string;
  topic: string;
  goal: string;
  activity: string;
  note: string;
}> = [];

export const attendanceSummary = [
  { label: "H", value: 0, color: "bg-[#2f8d74]", description: "Hadir" },
  { label: "I", value: 0, color: "bg-[#69aa91]", description: "Izin" },
  { label: "S", value: 0, color: "bg-[#a7cbb8]", description: "Sakit" },
  { label: "A", value: 0, color: "bg-[#ddb25a]", description: "Alpha" },
];

export const attendanceRecords: Array<{ name: string; nis: string; status: string; note: string }> = [];

export const scoreTypes = ["Tugas", "Quiz/Ulangan Harian", "Praktik", "Observasi"];

export const scoreEntries: Array<{ name: string; score: number; status: string }> = [];

export const scoreHistory: Array<{
  date: string;
  type: string;
  className: string;
  topic: string;
  average: number;
}> = [];

export const materials: Array<{
  title: string;
  type: string;
  className: string;
  subject: string;
  topic: string;
  meeting: string;
  updatedAt: string;
  thumbnail: string;
}> = [];

export const mediaAssets: Array<{
  title: string;
  format: string;
  size: string;
  linkedTo: string;
  uploadedAt: string;
  thumbnail: string;
}> = [];

export const videoAssets: Array<{
  title: string;
  source: string;
  className: string;
  topic: string;
  linkedTo: string;
  publishedAt: string;
  videoUrl: string;
  thumbnail: string;
}> = [];

export const recentActivities: string[] = [];

export const emptyThumbnail = createThumbnail("#d9d7cf", "#bdb7a7");
