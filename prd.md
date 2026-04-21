# PRD Final & Reusable Product Requirements Document

## 1. Ringkasan Produk

`Guruku` adalah aplikasi web untuk membantu guru mengelola aktivitas pembelajaran harian dalam satu sistem yang sederhana, cepat, dan mudah diakses dari desktop maupun mobile. Produk ini lahir dari kebutuhan nyata agar jurnal mengajar, absensi, nilai, materi, media, dan video tidak lagi tersebar di buku catatan, file terpisah, atau chat pribadi.

PRD ini disusun ulang dari proses praktik implementasi nyata dan dirapikan agar dapat dipakai kembali untuk proyek lain yang serupa, terutama portal guru sekolah, dashboard akademik guru, atau LMS sederhana berbasis sekolah.

## 2. Latar Belakang Masalah

Masalah utama yang ingin diselesaikan:

- guru kesulitan mencatat jurnal harian secara konsisten
- absensi siswa sering dicatat di tempat berbeda
- nilai harian tidak selalu tersimpan rapi dan mudah ditelusuri
- materi, media, dan video pembelajaran tersebar di banyak penyimpanan
- tidak ada satu dashboard sederhana yang memusatkan aktivitas guru

Akibatnya, pekerjaan administrasi guru menjadi lambat, berulang, dan sulit dipantau kembali.

## 3. Tujuan Produk

Produk ini bertujuan untuk:

- memusatkan administrasi harian guru dalam satu aplikasi
- memudahkan guru mengisi jurnal, absensi, dan nilai secara cepat
- memudahkan guru menyimpan dan menampilkan materi, media, serta video pembelajaran
- menyediakan halaman depan yang dapat menjadi etalase konten terbaru bagi siswa
- menyediakan fondasi MVP sekolah/guru yang bisa dikembangkan ke tahap yang lebih besar

## 4. Target Pengguna

### Pengguna utama

- guru mata pelajaran
- guru/admin pengelola konten dan data akademik

### Pengguna sekunder

- siswa yang melihat konten terbaru dan pengumuman guru di halaman depan

### Pengguna lanjutan pada fase berikutnya

- kepala sekolah
- wali kelas
- admin sekolah

## 5. Prinsip Produk

Prinsip utama yang harus dijaga:

- sederhana
- cepat dipakai
- sedikit distraksi
- mobile-first
- mudah dipahami pengguna non-teknis
- aman untuk data inti sekolah

Sistem MVP diprioritaskan untuk membantu kerja harian guru, bukan mengejar fitur kompleks yang memperlambat penggunaan.

## 6. Cakupan Produk

Produk dibagi menjadi dua area utama:

### A. Area publik

Berfungsi sebagai etalase konten terbaru untuk siswa dan pengunjung.

### B. Area dashboard guru

Berfungsi sebagai workspace internal untuk input, pengelolaan data, dan monitoring aktivitas pembelajaran.

## 7. Fitur Inti MVP

### 7.1 Beranda Publik

Fungsi:

- menampilkan slogan utama aplikasi
- menampilkan materi terbaru
- menampilkan media terbaru
- menampilkan video terbaru
- menampilkan pengumuman guru
- menyediakan akses ke login dan dashboard

Kebutuhan:

- urutan konten berdasarkan data terbaru
- tampilan visual yang ringkas dan menarik
- nyaman dibuka dari HP maupun desktop

### 7.2 Login

Fungsi:

- menyediakan form login yang sederhana dan fokus
- mengarahkan pengguna ke dashboard setelah autentikasi berhasil

Kebutuhan:

- proses login cepat
- tampilan ringan
- aman dan mudah dipahami

### 7.3 Dashboard Guru

Fungsi:

- menampilkan ringkasan aktivitas utama
- menampilkan metrik penting
- menampilkan jadwal hari ini
- menampilkan ringkasan kelas
- menyediakan akses cepat ke modul inti

Kebutuhan:

- sidebar sederhana
- tidak banyak tulisan yang mengganggu
- cepat dipindai

### 7.4 Manajemen Kelas

Fungsi:

- membaca daftar kelas dari data siswa
- menampilkan siswa per kelas
- membantu guru melihat kelas yang diajar

Kebutuhan:

- import data siswa melalui CSV
- pembentukan kelas otomatis dari data siswa
- dukungan hapus kelas dasar

### 7.5 Jurnal Harian Guru

Fungsi:

- menyimpan jurnal per pertemuan
- menampilkan riwayat jurnal
- menampilkan rekap jurnal

Kolom wajib:

- tanggal
- kelas
- mata pelajaran
- jam pelajaran
- materi yang diajarkan
- tujuan/kompetensi
- aktivitas pembelajaran
- catatan kendala/evaluasi

Kebutuhan:

- input cepat
- riwayat mudah dicari dan dibuka
- rekap per tanggal atau bulan
- output print dan PDF

### 7.6 Absensi Siswa

Fungsi:

- mencatat absensi per kelas dan tanggal
- menyimpan status kehadiran siswa
- menampilkan rekap dasar

Status minimal:

- `H` = Hadir
- `S` = Sakit
- `I` = Izin
- `A` = Alpha

Kebutuhan:

- default semua siswa hadir
- guru dapat mengubah status satu kelas sekaligus dengan cepat

### 7.7 Nilai Harian Siswa

Fungsi:

- menyimpan nilai per siswa
- mendukung beberapa jenis penilaian
- menampilkan riwayat nilai

Jenis penilaian minimum:

- tugas
- quiz/ulangan harian
- praktik
- observasi

Kebutuhan:

- input cepat
- dapat difilter berdasarkan kelas dan topik

### 7.8 Materi Pembelajaran

Fungsi:

- menyimpan materi ajar
- mengelompokkan materi berdasarkan kelas, mapel, topik, dan pertemuan
- menampilkan materi terbaru

Bentuk materi:

- teks singkat/deskripsi
- file dokumen
- link eksternal

### 7.9 Media Pembelajaran

Fungsi:

- menyimpan file media pembelajaran
- menampilkan metadata file
- menghubungkan media ke materi tertentu bila diperlukan

Bentuk media:

- gambar
- infografik
- audio
- presentasi

### 7.10 Video Guru

Fungsi:

- menyimpan video pembelajaran
- menghubungkan video ke kelas, mapel, dan topik
- menampilkan video terbaru

Bentuk video:

- link eksternal seperti YouTube atau web lain
- file video pada fase lanjutan

### 7.11 Pengaturan Guru

Fungsi:

- mengelola biodata guru
- mengelola foto profil
- mengelola username/login dan password
- mengelola pengumuman guru untuk beranda

Kebutuhan:

- nama sekolah tetap dan tidak editable
- pengumuman dapat diubah dari dashboard

## 8. Alur Pengguna Utama

### Alur guru

1. Login ke aplikasi
2. Membuka dashboard
3. Memilih kelas atau modul yang ingin dikelola
4. Mengisi jurnal
5. Mengisi absensi
6. Mengisi nilai
7. Mengunggah materi, media, atau video
8. Membuka kembali riwayat atau rekap bila diperlukan

### Alur siswa/pengunjung

1. Membuka halaman depan
2. Melihat pengumuman guru
3. Melihat materi terbaru
4. Melihat media terbaru
5. Melihat video terbaru

## 9. Kebutuhan Non-Fungsional

### Responsiveness

- antarmuka harus mobile-first
- semua modul utama nyaman digunakan di smartphone
- halaman tetap rapi di desktop dan tablet

### Performance

- ringan dan cepat dimuat
- tidak boros data
- aset visual harus dioptimalkan

### Usability

- navigasi sederhana
- form singkat
- teks mudah dibaca
- guru dapat menyelesaikan input inti dengan cepat

### Accessibility

- kontras warna cukup
- ukuran teks nyaman dibaca
- tombol dan input memiliki label jelas

### Security

- autentikasi login wajib tersedia
- password harus aman
- data guru dan siswa tidak boleh terbuka tanpa otorisasi
- akses file harus terkontrol

## 10. Arsitektur yang Direkomendasikan

PRD ini fleksibel untuk dipakai ulang, tetapi pola arsitektur minimum yang direkomendasikan adalah:

- frontend berbasis framework web modern
- backend app-layer sederhana
- autentikasi terintegrasi
- database relasional
- pengelolaan file dasar
- export dokumen untuk kebutuhan administrasi

Contoh stack yang terbukti cocok selama implementasi praktik:

- Next.js App Router
- Tailwind CSS
- Better Auth
- PostgreSQL
- Drizzle ORM
- route handlers internal

## 11. Model Data Minimum

Entitas minimum yang perlu ada:

- users
- teacher_profiles
- students
- classes
- journals
- attendances
- scores
- materials
- media_assets
- video_assets

Relasi minimal:

- satu guru dapat mengelola banyak kelas
- satu kelas memiliki banyak siswa
- jurnal, absensi, nilai, materi, media, dan video terhubung ke guru dan/atau kelas

## 12. Batasan MVP

Pada versi awal, prioritas utama adalah:

- login guru
- dashboard sederhana
- jurnal
- absensi
- nilai
- materi
- media dan video
- pengumuman guru

Fitur yang boleh ditunda:

- role kompleks multi-user
- audit log
- analitik mendalam
- integrasi LMS eksternal
- notifikasi otomatis
- sinkronisasi dengan sistem sekolah lain

## 13. Indikator Keberhasilan MVP

MVP dianggap berhasil bila:

- guru dapat login dengan akun nyata
- guru dapat mengisi jurnal dengan cepat
- guru dapat menginput absensi satu kelas dengan mudah
- guru dapat menginput nilai tanpa proses rumit
- guru dapat menyimpan dan menemukan kembali materi, media, dan video
- halaman depan menampilkan konten dan pengumuman terbaru
- aplikasi berjalan stabil di mobile dan desktop
- pengguna merasa aplikasi mudah dipahami tanpa pelatihan teknis panjang

## 14. Roadmap Lanjutan

### Fase 1

- stabilisasi CRUD semua modul inti
- perbaikan validasi input
- konsistensi UI dan alur simpan/edit/hapus

### Fase 2

- export absensi dan nilai
- detail page konten
- validasi upload dan import CSV yang lebih ketat

### Fase 3

- role admin sekolah, kepala sekolah, dan wali kelas
- audit log
- reporting dan laporan formal

### Fase 4

- notifikasi
- kalender akademik
- integrasi LMS
- evaluasi dukungan offline sederhana

## 15. Langkah Terbaik untuk Proyek Serupa

Urutan kerja terbaik yang direkomendasikan berdasarkan praktik implementasi:

1. mulai dari PRD sederhana dan fokus pada alur inti guru
2. validasi UI/UX lebih dulu dengan frontend cepat
3. sederhanakan navigasi sebelum menambah fitur
4. gunakan mock data untuk mematangkan alur
5. ubah ke API layer, lalu auth, lalu database
6. kunci model data inti lebih awal
7. prioritaskan fitur yang dipakai harian
8. uji build pada setiap iterasi
9. setelah stabil, tambahkan export, upload, dan fitur admin lanjutan

## 16. Reusability

PRD ini dapat digunakan kembali untuk:

- portal guru sekolah
- dashboard akademik guru
- LMS sederhana sekolah
- sistem administrasi kelas berbasis web

Dokumen ini sengaja dibuat cukup umum agar bisa menjadi template proyek lain, namun tetap cukup konkret untuk langsung dipakai sebagai dasar implementasi.
