# 🎨 Sekre Frontend

**Dashboard Web Admin Organisasi Kampus berbasis SvelteKit & Tailwind CSS v4**

[![Svelte Version](https://img.shields.io/badge/Svelte-5.55-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/)
[![SvelteKit Version](https://img.shields.io/badge/SvelteKit-2.57-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Sekre Frontend adalah modul aplikasi web (Dashboard Admin) untuk platform Sekre. Dirancang sebagai pusat komando bagi pengurus organisasi mahasiswa dalam mengelola divisi kerja, memantau pencatatan kas finansial, menjadwalkan acara, dan mengalokasikan program tugas secara tersinkronisasi. 

Aplikasi ini dibangun menggunakan teknologi mutakhir **Svelte 5** dengan sistem reaktivitas **Runes** baru, dipadukan dengan **SvelteKit 2** untuk optimasi pemuatan halaman yang sangat cepat melalui SSR (Server-Side Rendering) dan styling modern menggunakan **Tailwind CSS v4**.

---

## 🚀 Fitur Unggulan Modul Web

Setiap halaman di rancang dengan keindahan visual modern, transisi halus, serta kegunaan tingkat tinggi:

### 1. 📊 Dashboard Utama (`/app`)
* **Statistik Cepat**: Menampilkan ringkasan ringkas jumlah anggota aktif, total kas saldo organisasi, total divisi, dan jumlah tugas aktif.
* **Tugas Mendatang**: Daftar cepat tugas-tugas dengan prioritas tinggi yang mendekati tenggat waktu (deadline).
* **Aktivitas Finansial Terkini**: Menampilkan grafik kas organisasi dengan visualisasi harmonis.

### 2. 👥 Manajemen Anggota (`/app/members`)
* **Undang Anggota**: Antarmuka mudah bagi Owner/Admin untuk mengirim email undangan kepada anggota baru.
* **Role Management**: Perubahan hak akses anggota secara langsung (OWNER, ADMIN, MEMBER) dengan batasan RBAC.
* **Pruning List**: Fitur pencarian anggota dan penghapusan akses keanggotaan dari organisasi.

### 3. 🛡️ Autentikasi Berbasis Cookie & Keamanan Sesi
* **Server-side Auth Hooks**: Validasi token dan pemuatan sesi dijalankan di layer server (`hooks.server.ts`). Token JWT disimpan secara aman di HTTP-only cookie.
* **Locals Injection**: Sesi pengguna yang tervalidasi disisipkan ke dalam `event.locals` sehingga data pengguna selalu tersedia di load function halaman mana pun secara instan dan aman dari manipulasi klien.
* **Automatic Expiry Redirection**: Klien otomatis diarahkan ke `/login` jika sesi kedaluwarsa tanpa terjadinya kilatan (flash) konten dashboard.

### 4. 📋 Papan Tugas & Monitoring Progres (`/app/tasks`)
* **Kanban-Style Status**: Visualisasi penugasan berdasarkan status tugas (`TODO`, `IN PROGRESS`, `DONE`).
* **Assignment Badge**: Detail assigner, penanggung jawab (assignee), prioritas warna tugas (`LOW`, `MEDIUM`, `HIGH`), dan sisa hari menuju deadline.
* **Penyaringan Pintar**: Filter tugas berdasarkan divisi penanggung jawab, level prioritas, dan input teks pencarian.

### 5. 💰 Keuangan & Ledger Organisasi (`/app/finance`)
* **Buku Kas Digital**: Laporan riwayat transaksi keluar-masuk organisasi terperinci dengan perhitungan presisi aman rupiah (menghindari floating-point error).
* **Transaksi Ledger**: Penginputan dana kas masuk (`INCOME`) atau dana pengeluaran (`EXPENSE`) dengan kategori visual dan lampiran catatan/keterangan yang jelas.
* **Summary Banner**: Panel ringkasan interaktif yang menampilkan Total Pendapatan, Total Pengeluaran, dan Saldo Bersih saat ini.

### 6. 📂 Kelompok Kerja & Divisi (`/app/divisions`)
* **Struktur Divisi**: CRUD divisi kerja internal (misal: Divisi Kestari, Humas, Danus, Pengabdian Masyarakat).
* **Alokasi Anggota**: Antarmuka grafis untuk menambahkan atau memindahkan anggota ke divisi terkait dengan validasi konflik data silang.

### 7. 📅 Kalender Acara (`/app/events`)
* **Daftar Agenda**: Pencatatan acara internal organisasi, rapat koordinasi bulanan, maupun program kerja besar.
* **Date Range Check**: Validasi otomatis yang memastikan waktu akhir acara tidak mendahului waktu mulai acara.

---

## 🏗️ Pemanfaatan Teknologi Terkini

### Svelte 5 Runes (Reaktivitas Modern)
Aplikasi ini memanfaatkan arsitektur reaktivitas baru Svelte 5:
* **`$state()`**: Digunakan untuk mendeklarasikan state dinamis lokal di sisi klien yang langsung memicu pembaruan DOM saat nilainya berubah.
* **`$derived()`**: Menghitung state turunan secara otomatis (misalnya perhitungan total transaksi setelah filter diaktifkan).
* **`$effect()`**: Mengelola sinkronisasi efek samping klien seperti interaksi storage, pemanggilan analytics, atau visualisasi dinamis.

### Tailwind CSS v4 & Vite Integrator
* Menggunakan plugin `@tailwindcss/vite` untuk menggabungkan kompilasi CSS langsung ke dalam siklus build Vite.
* Pemuatan variabel CSS dinamis yang lebih efisien tanpa dependensi postcss ekstra.
* Penggunaan utility modern seperti `@tailwindcss/forms` untuk merapikan elemen input secara seragam.

---

## 📁 Struktur Direktori Frontend

```
sekre-frontend/
├── src/
│   ├── app.d.ts             # Deklarasi tipe global & event locals SvelteKit
│   ├── app.html             # Template HTML utama
│   ├── hooks.server.ts      # Server middleware penanganan session cookies & routing guard
│   │
│   ├── lib/                 # Modul pendukung yang dapat diimpor via alias `$lib`
│   │   ├── api/             # HTTP Client konfigurasi endpoint backend API
│   │   ├── components/      # Komponen UI Reusable (Button, Modal, Input, Badge, Sidebar, Navbar)
│   │   ├── features/        # Logika khusus per fitur (tugas, keuangan, divisi)
│   │   ├── server/          # Layanan eksklusif server (session retrieval, api key handling)
│   │   ├── stores/          # Svelte stores untuk global client state
│   │   └── utils/           # Helper formatter angka, format uang rupiah, parser tanggal
│   │
│   └── routes/              # Sistem routing berbasis direktori SvelteKit
│       ├── +layout.svelte   # Wrapper layout global
│       ├── +page.svelte     # Halaman landas (landing page) umum
│       ├── login/           # Formulir masuk akun
│       ├── register/        # Formulir pendaftaran organisasi & user baru
│       ├── logout/          # Endpoint penghancur sesi cookies
│       └── app/             # Area terproteksi khusus pengurus organisasi
│           ├── +layout      # Sidebar dan navigasi navigasi dalam dashboard
│           ├── +page        # Ringkasan visual dashboard utama
│           ├── divisions/   # Halaman kelola divisi
│           ├── events/      # Halaman agenda acara
│           ├── finance/     # Halaman buku kas keuangan
│           ├── members/     # Halaman keanggotaan organisasi
│           ├── settings/    # Pengaturan profil & organisasi
│           └── tasks/       # Papan monitoring tugas
│
├── static/                  # Aset statis publik (favicon, logo, gambar)
├── svelte.config.js         # Konfigurasi compiler Svelte & adapter output
├── tsconfig.json            # Konfigurasi pengetatan TypeScript
├── vite.config.ts           # Konfigurasi builder Vite
└── package.json             # Manajer modul Node & script build
```

---

## ⚡ Setup Lokal & Cara Menjalankan

### Prasyarat
* **Node.js**: Versi 22.0.0 atau lebih tinggi.
* **Bun**: Direkomendasikan sebagai package manager berkecepatan tinggi (atau gunakan `npm`).

### Mulai Menjalankan
1. **Pasang Dependensi**:
   ```bash
   bun install
   # atau menggunakan npm:
   npm install
   ```

2. **Konfigurasi Lingkungan (`.env`)**:
   Salin file template konfigurasi lingkungan dan sesuaikan URL backend API:
   ```bash
   cp .env.example .env
   # Edit berkas .env untuk mengarahkan ke API backend lokal atau production:
   # PUBLIC_API_URL=http://localhost:8080
   ```

3. **Jalankan Development Server**:
   ```bash
   bun run dev
   # atau menggunakan npm:
   npm run dev
   ```
   > Dashboard web admin sekarang aktif di **http://localhost:5173**.

4. **Lakukan Validasi Tipe Data (Typecheck)**:
   Sebelum melakukan commit kode, pastikan TypeScript tidak mendeteksi galat tipe data:
   ```bash
   bun run check
   ```

5. **Lakukan Build Produksi**:
   ```bash
   bun run build
   # Untuk menguji hasil build sebelum rilis:
   bun run preview
   ```
