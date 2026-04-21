# Resume PRD Final & Roadmap Implementasi Guruku

## 1. Ringkasan Eksekutif

`Guruku` adalah aplikasi web untuk membantu guru mengelola aktivitas pembelajaran harian dalam satu sistem yang sederhana, cepat, dan mudah diakses dari desktop maupun mobile. Masalah utama yang diselesaikan adalah tersebarnya jurnal mengajar, absensi, nilai, materi, media, dan video di berbagai catatan atau file terpisah, sehingga proses kerja guru menjadi lambat dan sulit ditelusuri kembali.

Target pengguna utama adalah guru mata pelajaran dan admin/guru pengelola. Pengguna sekunder adalah siswa yang mengakses halaman depan untuk melihat konten terbaru dan pengumuman guru. Posisi produk saat ini sudah berkembang dari `frontend-only` menjadi `fullstack dasar`, dengan autentikasi nyata, database PostgreSQL, API internal, penyimpanan data inti, upload dasar, dan export PDF untuk rekap jurnal.

Dokumen ini menjadi sumber kebenaran terbaru untuk kondisi produk saat ini sekaligus roadmap terbaik untuk melanjutkan pengembangan.

## 2. Perjalanan Iterasi Produk

Pengembangan Guruku berlangsung melalui iterasi praktik langsung yang berfokus pada penyederhanaan alur guru dan validasi UI sebelum backend diperkuat. Perubahan besar yang sudah terjadi:

1. Halaman depan dan login dipisahkan agar fungsi publik dan fungsi internal guru tidak bercampur.
2. Dashboard disederhanakan agar minim distraksi, sedikit tulisan, dan mudah dipindai saat digunakan guru.
3. Modul `Materi`, `Media`, dan `Video` disatukan dalam alur konten yang lebih konsisten.
4. Warna, hierarki teks, sidebar, ikon, dan layout terus dirapikan agar lebih clean, presisi, dan ramah mobile.
5. Mode terang dan gelap ditambahkan agar aplikasi nyaman dipakai di berbagai kondisi.
6. Modul `Pengaturan` diperkuat untuk profil guru, akun login, foto profil, dan pengumuman guru.
7. Sistem berpindah dari data mock ke API internal, lalu ke autentikasi Better Auth, PostgreSQL, dan Drizzle ORM.
8. Fitur rekap jurnal berkembang menjadi filter per tanggal/per bulan, print, dan download PDF.

Pelajaran utama dari iterasi ini adalah bahwa alur guru harus selalu lebih dulu disederhanakan sebelum fitur ditambah, dan setiap iterasi perlu divalidasi lewat build agar perubahan visual tetap aman secara teknis.

## 3. PRD Final Produk

### 3.1 Tujuan Produk

- Memusatkan administrasi harian guru dalam satu aplikasi yang ringan dan cepat.
- Memudahkan guru mencatat jurnal, absensi, nilai, dan mengelola konten belajar.
- Menyediakan halaman depan yang menarik siswa melalui konten terbaru dan pengumuman guru.
- Menyediakan fondasi MVP sekolah/guru yang dapat dilanjutkan ke produk yang lebih lengkap.

### 3.2 Modul Publik

#### Beranda

- Menampilkan slogan utama terbaru: `Belajar tanpa Batas`.
- Menampilkan materi terbaru, media terbaru, dan video terbaru dalam urutan terbaru.
- Menampilkan pengumuman guru yang dikelola dari dashboard admin/guru.
- Menyediakan akses cepat ke login dan dashboard.
- Berfungsi sebagai etalase konten untuk siswa.

#### Login

- Menyediakan form login sederhana dan fokus.
- Mengarahkan pengguna ke dashboard setelah autentikasi berhasil.

### 3.3 Modul Dashboard

#### Dashboard

- Menampilkan ringkasan metrik utama.
- Menampilkan menu cepat ke modul inti.
- Menampilkan jadwal hari ini.
- Menampilkan ringkasan kelas yang diampu.

#### Kelas

- Fokus pada upload data siswa melalui CSV.
- Membaca daftar kelas dari data siswa yang diimpor.
- Menampilkan siswa yang terdaftar per kelas.
- Mendukung hapus kelas dasar.

#### Jurnal

- Input jurnal per pertemuan dengan kolom tanggal, kelas, mata pelajaran, jam, materi, tujuan, aktivitas, dan catatan.
- Menyimpan jurnal ke database.
- Menampilkan riwayat jurnal.
- Menyediakan rekap jurnal berdasarkan rentang tanggal atau bulan.
- Mendukung `print` dan `download PDF` rekap jurnal.

#### Absensi

- Input absensi satu kelas sekaligus.
- Default status siswa adalah `H`.
- Pilihan status adalah `H`, `S`, `I`, `A`.
- Menampilkan rekap dan riwayat absensi dasar.

#### Nilai

- Input nilai harian per siswa.
- Mendukung jenis penilaian seperti tugas, quiz/ulangan, praktik, dan observasi.
- Menampilkan riwayat nilai dasar.

#### Materi

- Menyimpan materi pembelajaran dengan judul, kelas, mapel, topik, pertemuan, deskripsi, file/tautan, dan thumbnail.
- Menampilkan materi terbaru yang kemudian juga muncul di halaman depan.

#### Media & Video

- Menyimpan media pembelajaran dengan metadata file.
- Menyimpan video pembelajaran melalui tautan eksternal seperti YouTube atau web lain.
- Menyimpan thumbnail media/video.
- Menampilkan konten terbaru di dashboard dan halaman depan.

#### Pengaturan

- Mengelola biodata guru.
- Mengelola foto profil.
- Mengelola username/login dan password.
- Mengelola pengumuman guru yang tampil di beranda.
- Nama sekolah tetap dan tidak dapat diubah dari pengaturan.

### 3.4 Kebutuhan Non-Fungsional

- Antarmuka mobile-first dan nyaman di perangkat guru.
- Navigasi sederhana, tidak ramai, dan mudah dipahami pengguna non-teknis.
- Halaman cepat dimuat dan ringan.
- Data disimpan aman dengan autentikasi login.
- Tampilan tetap rapi di mode terang dan gelap.

## 4. Arsitektur Implementasi Saat Ini

Implementasi Guruku saat ini menggunakan arsitektur fullstack sederhana berbasis satu aplikasi Next.js:

- `Frontend`: Next.js App Router, Tailwind CSS, komponen UI gaya shadcn, dan `next-themes`.
- `Backend app-layer`: route handlers Next.js di `/app/api/...`.
- `Auth`: Better Auth.
- `Database`: PostgreSQL dengan Drizzle ORM.
- `File handling`: upload dasar ke `public/uploads`.
- `Export dokumen`: rekap jurnal ke PDF dengan `pdf-lib`.

Struktur data inti saat ini sudah mencakup:

- pengguna dan sesi auth
- profil guru
- data siswa
- katalog kelas
- jurnal
- absensi
- nilai
- materi
- media
- video

Arsitektur ini cukup stabil untuk MVP, sekaligus masih sederhana untuk dikembangkan lebih lanjut tanpa memecah sistem ke service terpisah.

## 5. Status Fitur Nyata

### Sudah Berjalan

- Login menggunakan Better Auth.
- API internal untuk dashboard, jurnal, absensi, nilai, materi, media-video, pengaturan, kelas, dan akun.
- Penyimpanan profil guru ke PostgreSQL.
- Upload foto profil guru.
- Pengelolaan username/login dan password.
- Import siswa menggunakan CSV.
- Pembacaan kelas dari data siswa.
- Hapus kelas dasar.
- Penyimpanan jurnal ke database.
- Filter dan rekap jurnal.
- Download PDF dan print jurnal.
- Pengumuman guru dapat diedit dari admin/pengaturan dan tampil di beranda.
- Penyimpanan materi, media, dan video ke database dasar.
- Halaman depan membaca konten terbaru dari data aktual aplikasi.

### Sudah Ada Tetapi Perlu Penyempurnaan

- CRUD kelas masih dasar dan belum selengkap modul master data penuh.
- Absensi dan nilai sudah tersimpan, tetapi pengalaman edit/hapus dan ekspornya belum setara jurnal.
- Upload file dasar sudah ada, tetapi validasi dan pengelolaan file masih minimal.
- Tampilan dashboard sudah usable, namun masih bisa dipoles lagi untuk konsistensi semua modul.
- Pengaturan akun sudah aktif, namun belum ada alur pemulihan akun atau manajemen multi-user yang lebih kaya.

### Belum Ada / Roadmap

- Edit/hapus penuh untuk semua entitas di semua modul.
- Export absensi dan nilai ke PDF/Excel.
- Detail page untuk materi, media, dan video.
- Role multi-user kompleks seperti admin sekolah, kepala sekolah, atau wali kelas.
- Audit log aktivitas penting.
- Monitoring operasional dan reporting yang lebih formal.

## 6. Gap dan Batasan Saat Ini

Walaupun fondasi fullstack sudah berjalan, masih ada beberapa batasan penting:

1. Belum semua modul memiliki CRUD lengkap, terutama edit/hapus yang konsisten.
2. Export absensi dan nilai belum setara jurnal.
3. Validasi import CSV masih perlu diperketat agar lebih tahan terhadap format salah.
4. Hak akses masih sederhana dan belum mendukung skenario multi-peran kompleks.
5. Belum ada audit log untuk perubahan penting seperti edit nilai, hapus data, atau update akun.
6. Belum ada monitoring teknis, pelacakan error operasional, atau analitik penggunaan.
7. Pengelolaan file masih berbasis penyimpanan lokal `public/uploads`, sehingga belum optimal untuk skala lebih besar.

## 7. Langkah Terbaik Selama Proses Pembuatan

Berikut adalah urutan kerja terbaik yang terbukti paling efektif selama praktik membangun Guruku, dan dapat dipakai ulang untuk proyek pendidikan sejenis:

1. Mulai dari PRD sederhana dan fokus pada alur kerja guru, bukan fitur kompleks.
2. Validasi UI/UX lebih dulu dengan frontend yang cepat dibangun agar alur benar-benar terasa ringan.
3. Sederhanakan navigasi, tulisan, dan struktur halaman sebelum menambah banyak fitur.
4. Gunakan mock data lebih dulu untuk mematangkan pola UI, lalu ubah bertahap ke API layer, auth, dan database.
5. Kunci model data inti lebih awal: guru, siswa, kelas, jurnal, absensi, nilai, materi, media, dan video.
6. Prioritaskan fitur yang dipakai harian guru sebelum fitur pelaporan atau administrasi lanjutan.
7. Uji build di setiap iterasi agar perubahan desain tidak merusak integrasi teknis.
8. Setelah fondasi stabil, baru tambahkan export, upload, dan penyempurnaan admin.

Urutan ini terbukti membantu menjaga produk tetap bergerak cepat tanpa kehilangan arah arsitektur.

## 8. Roadmap Lanjutan yang Direkomendasikan

### Fase 1: Stabilisasi Modul Inti

- Lengkapi CRUD semua modul inti.
- Rapikan validasi input dan alur error.
- Seragamkan pengalaman simpan, edit, dan hapus antar modul.

### Fase 2: Penyempurnaan Operasional Guru

- Tambahkan export absensi dan nilai.
- Tambahkan detail page untuk materi, media, dan video.
- Perketat validasi upload file dan import CSV.

### Fase 3: Penguatan Administrasi Sekolah

- Tambahkan role admin sekolah, kepala sekolah, dan pengawas.
- Tambahkan audit log aktivitas penting.
- Tambahkan laporan dan reporting yang lebih formal.

### Fase 4: Integrasi dan Ekspansi

- Integrasi notifikasi.
- Integrasi kalender akademik.
- Integrasi LMS atau e-learning lain bila dibutuhkan sekolah.
- Evaluasi kebutuhan mode offline sederhana atau sinkronisasi terbatas.

## 9. Template Reuse untuk Proyek Lain

Resume ini dapat dipakai ulang sebagai pola dasar untuk proyek pendidikan serupa, terutama untuk portal guru sekolah atau LMS sederhana.

### Modul Inti Minimum

- beranda publik
- login
- dashboard guru
- kelas dan siswa
- jurnal
- absensi
- nilai
- materi
- media/video
- pengaturan guru

### Stack Teknis Minimum

- Next.js
- Tailwind CSS
- auth terintegrasi
- PostgreSQL
- ORM yang ringan dan terstruktur
- penyimpanan file dasar

### Urutan Implementasi Minimum

1. susun PRD sederhana
2. buat frontend dan validasi alur
3. rapikan navigasi dan pengalaman guru
4. tambahkan API internal
5. pasang auth
6. sambungkan database
7. aktifkan upload dan export
8. lanjutkan fitur admin dan reporting

### Indikator MVP Siap Dipakai

Sebuah MVP sekolah/guru dapat dianggap siap dipakai ketika:

- guru bisa login dengan akun nyata
- guru bisa mengelola jurnal, absensi, nilai, dan konten inti
- data tersimpan konsisten ke database
- halaman depan menampilkan konten dan pengumuman terbaru
- aplikasi nyaman dipakai di mobile dan desktop
- proses kerja utama tidak membingungkan dan tidak memerlukan pelatihan teknis panjang

## 10. Pembaruan Penting dari Resume Lama

Resume lama sudah tidak lagi akurat karena masih menyebut aplikasi sebagai `frontend-only`. Dokumen ini memperbarui asumsi tersebut dengan kondisi nyata saat ini:

- aplikasi sudah memiliki Better Auth
- aplikasi sudah memakai PostgreSQL dan Drizzle ORM
- aplikasi sudah memiliki API routes internal
- aplikasi sudah memiliki upload dasar
- aplikasi sudah memiliki export PDF jurnal
- pengaturan sekolah tidak lagi editable
- fokus logo sekolah sudah tidak lagi menjadi bagian utama pengaturan
- pengumuman guru kini menjadi konten admin yang tampil di beranda
- jurnal kini memiliki rekap berdasarkan tanggal/bulan serta output PDF/print

Dengan demikian, dokumen ini menjadi baseline yang lebih tepat untuk tahap pengembangan berikutnya maupun untuk proyek sekolah lain yang ingin memakai pola serupa.
