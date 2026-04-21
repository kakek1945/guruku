function createThumbnail(bg: string, _accent: string) {
  return bg;
}

export const teacherProfile = {
  name: "Siti Rahma, S.Pd.",
  role: "Guru Matematika",
  school: "SMP Negeri Kep. Meranti",
  nip: "19890412 201402 2 001",
  email: "siti.rahma@smpn4bdg.sch.id",
  phone: "0812-3456-7890",
  address: "Jl. Sukamaju No. 14, Bandung",
  announcementTitle: "Pengumuman guru",
  announcementBody:
    "Selamat datang di GuruKu. Silakan cek materi terbaru dan ikuti arahan belajar yang dibagikan guru pada pekan ini.",
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
  { label: "Jadwal hari ini", value: "4 sesi", note: "2 kelas dimulai sebelum jam 10.00" },
  { label: "Jurnal selesai", value: "7/9", note: "2 jurnal belum diisi untuk kelas IX-B" },
  { label: "Absensi masuk", value: "92%", note: "Rata-rata kehadiran minggu ini" },
  { label: "Nilai terbaru", value: "36 entri", note: "Input quiz pecahan kelas VII-A" },
];

export const scheduleToday = [
  {
    time: "07.15 - 08.35",
    className: "VII-A",
    subject: "Matematika",
    topic: "Persamaan Linear",
    status: "Jurnal belum diisi",
  },
  {
    time: "09.00 - 10.20",
    className: "VIII-B",
    subject: "Matematika",
    topic: "Statistika",
    status: "Absensi selesai",
  },
  {
    time: "10.35 - 11.55",
    className: "IX-A",
    subject: "Matematika",
    topic: "Latihan Ujian",
    status: "Nilai perlu direkap",
  },
];

export const classAssignments = [
  {
    className: "VII-A",
    subject: "Matematika",
    students: 32,
    journalProgress: "4/5 pertemuan",
    latestTopic: "Persamaan Linear",
  },
  {
    className: "VIII-B",
    subject: "Matematika",
    students: 30,
    journalProgress: "5/5 pertemuan",
    latestTopic: "Statistika",
  },
  {
    className: "IX-A",
    subject: "Matematika",
    students: 31,
    journalProgress: "3/5 pertemuan",
    latestTopic: "Tryout Paket 2",
  },
];

export const studentRoster = [
  { name: "Aulia Nisa", nis: "22104", className: "VII-A" },
  { name: "Bagas Pratama", nis: "22111", className: "VII-A" },
  { name: "Citra Lestari", nis: "22119", className: "VII-A" },
  { name: "Dimas Akbar", nis: "22122", className: "VII-A" },
  { name: "Eka Putri", nis: "22131", className: "VII-A" },
];

export const studentCsvTemplateColumns = ["nis", "nama_siswa", "kelas", "jenis_kelamin"];

export const studentCsvTemplateRows = [
  ["22104", "Aulia Nisa", "VII-A", "P"],
  ["22111", "Bagas Pratama", "VII-A", "L"],
];

export const journalHistory = [
  {
    date: "19 Apr 2026",
    className: "VIII-B",
    subject: "Matematika",
    hours: "2 JP",
    topic: "Penyajian Data",
    goal: "Siswa mampu membaca diagram batang dan diagram garis.",
    activity:
      "Diskusi contoh soal, latihan mandiri berpasangan, dan refleksi singkat di akhir sesi.",
    note: "Perlu penguatan pada interpretasi grafik untuk 6 siswa.",
  },
  {
    date: "18 Apr 2026",
    className: "VII-A",
    subject: "Matematika",
    hours: "2 JP",
    topic: "Persamaan Linear Satu Variabel",
    goal: "Siswa memahami konsep keseimbangan pada persamaan sederhana.",
    activity: "Guru menjelaskan konsep inti, siswa mengerjakan latihan bertingkat.",
    note: "Media visual membantu siswa lebih cepat memahami contoh.",
  },
];

export const attendanceSummary = [
  { label: "H", value: 28, color: "bg-[#2f8d74]", description: "Hadir" },
  { label: "I", value: 2, color: "bg-[#69aa91]", description: "Izin" },
  { label: "S", value: 1, color: "bg-[#a7cbb8]", description: "Sakit" },
  { label: "A", value: 1, color: "bg-[#ddb25a]", description: "Alpha" },
];

export const attendanceRecords = [
  { name: "Aulia Nisa", nis: "22104", status: "H", note: "Default hadir" },
  { name: "Bagas Pratama", nis: "22111", status: "H", note: "Default hadir" },
  { name: "Citra Lestari", nis: "22119", status: "H", note: "Default hadir" },
  { name: "Dimas Akbar", nis: "22122", status: "H", note: "Default hadir" },
  { name: "Eka Putri", nis: "22131", status: "H", note: "Default hadir" },
];

export const scoreTypes = ["Tugas", "Quiz/Ulangan Harian", "Praktik", "Observasi"];

export const scoreEntries = [
  { name: "Aulia Nisa", score: 88, status: "Tuntas" },
  { name: "Bagas Pratama", score: 76, status: "Perlu tindak lanjut" },
  { name: "Citra Lestari", score: 92, status: "Tuntas" },
  { name: "Dimas Akbar", score: 81, status: "Tuntas" },
  { name: "Eka Putri", score: 74, status: "Perlu tindak lanjut" },
];

export const scoreHistory = [
  {
    date: "17 Apr 2026",
    type: "Quiz/Ulangan Harian",
    className: "VII-A",
    topic: "Persamaan Linear",
    average: 82,
  },
  {
    date: "15 Apr 2026",
    type: "Tugas",
    className: "VIII-B",
    topic: "Diagram Batang",
    average: 85,
  },
];

export const materials = [
  {
    title: "Ringkasan Persamaan Linear",
    type: "PDF",
    className: "VII-A",
    subject: "Matematika",
    topic: "Bab 2",
    meeting: "Pertemuan 4",
    updatedAt: "19 Apr 2026",
    thumbnail: createThumbnail("#2f8a72", "#1f5f4c"),
  },
  {
    title: "Slide Statistika Dasar",
    type: "PPT",
    className: "VIII-B",
    subject: "Matematika",
    topic: "Bab 4",
    meeting: "Pertemuan 2",
    updatedAt: "18 Apr 2026",
    thumbnail: createThumbnail("#76ad95", "#2e7963"),
  },
  {
    title: "Latihan Mandiri Ujian",
    type: "Link",
    className: "IX-A",
    subject: "Matematika",
    topic: "Tryout",
    meeting: "Pertemuan 1",
    updatedAt: "16 Apr 2026",
    thumbnail: createThumbnail("#d9b35a", "#b6842e"),
  },
];

export const mediaAssets = [
  {
    title: "Infografik Jenis Diagram",
    format: "PNG",
    size: "1.8 MB",
    linkedTo: "Materi Statistika Dasar",
    uploadedAt: "18 Apr 2026",
    thumbnail: createThumbnail("#90c1ad", "#2f8d74"),
  },
  {
    title: "Audio Penjelasan Rumus",
    format: "MP3",
    size: "3.1 MB",
    linkedTo: "Jurnal Persamaan Linear",
    uploadedAt: "17 Apr 2026",
    thumbnail: createThumbnail("#c5d8cb", "#5c9c83"),
  },
];

export const videoAssets = [
  {
    title: "Video Pembahasan Soal Persamaan Linear",
    source: "YouTube",
    className: "VII-A",
    topic: "Bab 2",
    linkedTo: "Materi Ringkasan Persamaan Linear",
    publishedAt: "19 Apr 2026",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: createThumbnail("#2d8a71", "#184f42"),
  },
  {
    title: "Rekaman Penjelasan Diagram Batang",
    source: "Google Drive",
    className: "VIII-B",
    topic: "Bab 4",
    linkedTo: "Slide Statistika Dasar",
    publishedAt: "17 Apr 2026",
    videoUrl: "https://drive.google.com/file/d/example/view",
    thumbnail: createThumbnail("#ddb25a", "#ae7f2e"),
  },
];

export const recentActivities = [
  "Jurnal VIII-B berhasil disimpan untuk pertemuan ke-5.",
  "Absensi VII-A sudah lengkap dengan 1 siswa sakit.",
  "Materi PDF baru diunggah ke topik Persamaan Linear.",
  "Nilai quiz kelas IX-A menunggu validasi akhir.",
];
