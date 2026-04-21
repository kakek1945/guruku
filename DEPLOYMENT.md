# Deployment Guide: Vercel + Supabase

Dokumen ini menyiapkan deployment `Guruku` ke Vercel dengan database PostgreSQL di Supabase.

## 1. Ringkasan Arsitektur Deployment

- App runtime: Vercel
- Database runtime: Supabase Postgres
- Auth: Better Auth di route Next.js yang sama
- Runtime database connection: Supabase pooled connection string
- Migration database connection: Supabase direct connection string

Alasan pemisahan URL database:

- untuk runtime Vercel yang bersifat serverless, gunakan pooled connection
- untuk migrasi schema, gunakan direct connection

Supabase secara resmi merekomendasikan:
- direct connection untuk migrasi dan tool database
- transaction pooler untuk serverless functions  
Sumber: [Supabase database connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres)

Vercel juga mengelola environment variables per environment deployment dari dashboard project.  
Sumber: [Vercel environment variables docs](https://vercel.com/docs/environment-variables)

## 2. Environment Variables yang Wajib

Tambahkan semua env berikut di Vercel Project Settings:

```env
DATABASE_URL=postgres://...pooler.supabase.com:6543/postgres
MIGRATION_DATABASE_URL=postgres://...supabase.co:5432/postgres
BETTER_AUTH_SECRET=isi-random-string-panjang
BETTER_AUTH_URL=https://your-domain.vercel.app
```

Env opsional:

```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_AUTH_BASE_URL=
```

Catatan:

- `DATABASE_URL` untuk runtime app di Vercel sebaiknya memakai Supabase transaction pooler
- `MIGRATION_DATABASE_URL` untuk `drizzle-kit migrate` sebaiknya memakai direct connection Supabase
- `BETTER_AUTH_URL` harus diisi domain publik Vercel Anda
- `NEXT_PUBLIC_*` tidak wajib bila frontend, API, dan auth berada di domain yang sama

## 3. Cara Mengambil URL dari Supabase

Di dashboard Supabase:

1. buka project
2. klik `Connect`
3. ambil dua URL:
   - `Transaction pooler` untuk `DATABASE_URL`
   - `Direct connection` untuk `MIGRATION_DATABASE_URL`

Pemetaan yang dipakai:

- runtime app Vercel: pooled URL
- migrasi: direct URL

## 4. Local Verification Sebelum Deploy

Build produksi yang sudah diverifikasi:

```powershell
npm.cmd run build
```

Untuk migrasi database:

```powershell
npm.cmd run db:migrate
```

Untuk seed awal bila diperlukan:

```powershell
npm.cmd run db:seed
```

## 5. Alur Deploy yang Direkomendasikan

### Opsi A: Via GitHub + Vercel Dashboard

1. pastikan repo GitHub sudah public/private dan up to date
2. import repo ke Vercel
3. isi environment variables
4. deploy
5. setelah deploy sukses, update `BETTER_AUTH_URL` bila domain berubah
6. redeploy sekali lagi agar auth memakai URL final

### Opsi B: Via Vercel CLI

1. login ke Vercel CLI
2. link project
3. set env
4. deploy production

Contoh:

```powershell
vercel
vercel env add DATABASE_URL
vercel env add MIGRATION_DATABASE_URL
vercel env add BETTER_AUTH_SECRET
vercel env add BETTER_AUTH_URL
vercel --prod
```

## 6. Langkah Database Setelah Project Vercel Terhubung

Salah satu dari dua cara ini harus dilakukan:

### Cara 1: Migrasi dari lokal

Gunakan env Supabase di lokal lalu jalankan:

```powershell
npm.cmd run db:migrate
npm.cmd run db:seed
```

### Cara 2: Migrasi dari environment yang sudah terhubung ke Supabase

Pastikan `MIGRATION_DATABASE_URL` terarah ke direct connection Supabase, lalu jalankan migrasi dari mesin yang memiliki akses.

## 7. Checklist Deploy

- repo GitHub sudah tersinkron
- `npm run build` lolos
- `DATABASE_URL` memakai pooled URL Supabase
- `MIGRATION_DATABASE_URL` memakai direct URL Supabase
- `BETTER_AUTH_SECRET` terisi
- `BETTER_AUTH_URL` sesuai domain Vercel
- migrasi database sudah dijalankan
- seed admin awal sudah dijalankan bila diperlukan
- login, logout, dan dashboard diuji di domain deployment

## 8. Catatan Implementasi yang Sudah Disiapkan di Repo

Project ini sudah disesuaikan untuk deployment:

- runtime database sudah mendukung SSL untuk host non-local
- auth base URL dapat otomatis fallback ke `VERCEL_URL` bila perlu
- auth dan API client sudah mendukung same-origin deployment
- drizzle config sudah mendukung `MIGRATION_DATABASE_URL`

## 9. Hal yang Perlu Diuji Setelah Deploy

Uji minimum:

1. buka halaman depan
2. login dengan akun guru
3. buka dashboard
4. simpan perubahan profil guru
5. cek pengumuman tampil di beranda
6. import siswa CSV
7. simpan jurnal
8. download PDF jurnal
9. upload foto profil

Jika semua lolos, maka deployment dasar ke Vercel + Supabase sudah siap dipakai.
