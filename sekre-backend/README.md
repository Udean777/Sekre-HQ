# 🔙 Sekre Backend

**Multi-tenant SaaS REST API Engine untuk Manajemen Organisasi Kampus**

[![Go Version](https://img.shields.io/badge/Go-1.26-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![GORM v2](https://img.shields.io/badge/ORM-GORM_v2-blue?style=for-the-badge&logo=go&logoColor=white)](https://gorm.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Sekre Backend adalah modul engine RESTful API utama yang mengelola logika bisnis, autentikasi, otorisasi peran, validasi input, pencatatan keuangan aman, koordinasi divisi, serta penjadwalan tugas untuk platform Sekre. Dibangun menggunakan bahasa pemrograman Go dengan prinsip arsitektur bersih (Clean Architecture) untuk menjamin kode yang teruji, mudah dipelihara, dan sangat aman.

---

## 🛠️ Tech Stack & Dependencies

### Core Engine
* **Bahasa**: Go 1.26
* **HTTP Routing**: `gorilla/mux` (pemuatan cepat, mendukung middleware chain)
* **Object-Relational Mapping (ORM)**: `GORM v2`
* **Basis Data**: `PostgreSQL 16+`
* **Autentikasi**: `golang-jwt/jwt/v5` + `bcrypt` untuk pengamanan sandi
* **Logging terstruktur**: `zerolog` (output format JSON berkecepatan tinggi)
* **Validasi Input**: `go-playground/validator/v10`
* **Pembatas Request (Rate Limiter)**: `golang.org/x/time/rate` (Token Bucket Algorithm)
* **Eksposur Metrik**: `prometheus/client_golang` untuk pemantauan runtime server
* **Pemroses Latar Belakang (Cron Scheduler)**: `robfig/cron/v3`

### Framework Pengujian (Testing)
* **Test Runner**: bawaan `go test` + `gotestsum` untuk visualisasi pengujian yang rapi
* **Klaim Pengujian (Assertions)**: `stretchr/testify`
* **Peniruan Interface (Mocks Generator)**: `vektra/mockery v2`
* **Basis Data Pengujian Integrasi**: `testcontainers-go` (PostgreSQL di dalam Docker container secara otomatis saat unit test berjalan)
* **Ambang Batas Coverage**: Minimal **60%** coverage wajib lolos di tahap CI/CD pipeline.

---

## 🏗️ Clean Architecture & Struktur Layer

Modul backend ini secara konsisten mengimplementasikan arsitektur bersih (Clean Architecture) untuk meminimalkan ketergantungan antar-komponen luar dengan logika inti bisnis:

```text
               ┌──────────────────────────────┐
               │    📂 delivery (HTTP)        │ Request / Response
               └──────────────┬───────────────┘
                              │ calls
               ┌──────────────▼───────────────┐
               │  📂 application (Use Cases)   │ Orkestrasi Bisnis & Transaksi DB
               └──────────────┬───────────────┘
                              │ calls
               ┌──────────────▼───────────────┐
               │      📂 domain (Entities)     │ Model Data, Logika Murni, Kontrak/Ports
               └──────────────▲───────────────┘
                              │ implements
               ┌──────────────┴───────────────┐
               │  📂 infrastructure (GORM, JWT)│ Konektor DB, Token, Bcrypt
               └──────────────────────────────┘
```

### Tanggung Jawab Masing-Masing Layer:
1. **Domain Layer (`internal/domain`)**:
   * Menampung entitas data utama seperti `User`, `Organization`, `Task`, `Member`, `Division`, `Event`, `Transaction`, `AuditLog`.
   * Mengatur *Value Objects* aman (misalnya `valueobject.Money` untuk representasi kas finansial).
   * Mendefinisikan kontrak interface repository (misalnya `repository.TaskRepository`) sebagai penunjuk arah bagi layer infrastruktur.
2. **Application Layer (`internal/application`)**:
   * Tempat implementasi *Use Case* atau proses bisnis utama. Layer ini memanggil repository, mengoordinasikan entitas, serta menjamin batasan transaksi basis data (`gorm.DB` transaction boundary).
3. **Delivery Layer (`internal/delivery/http`)**:
   * Bertanggung jawab untuk menyajikan REST API. Menerima request HTTP, melakukan validasi payload JSON, menyaring data lewat middleware keamanan, dan menyusun format response JSON standar.
4. **Infrastructure Layer (`internal/infrastructure`)**:
   * Berisi detail teknis implementasi database repository dengan GORM, konfigurasi generate token JWT, enkripsi sandi via bcrypt, serta interaksi ke komponen sistem operasi luar lainnya.

---

## 📁 Struktur Direktori Backend

```
sekre-backend/
├── cmd/
│   ├── api/                  # Titik masuk utama HTTP API Server
│   ├── dbctl/                # Perkakas inisialisasi basis data (database control)
│   └── migrate/              # Eksekutor migrasi SQL database
│
├── internal/
│   ├── application/          # Use cases (logika pendaftaran, manajemen tugas, kas keuangan)
│   ├── config/               # Struktur konfigurasi variabel lingkungan (.env)
│   ├── delivery/http/        # Handlers HTTP API, routing, & middleware
│   │   ├── handler/          # Pengolah request (auth, divisi, tugas, keuangan, dll)
│   │   └── middleware/       # Autentikasi, rate limit, logging, dan CORS
│   ├── domain/               # Entitas inti, objek nilai (valueobject), dan interface repositori
│   ├── infrastructure/       # Implementasi repository GORM, modul token JWT, dan bcrypt
│   └── scheduler/            # Pengelola tugas terjadwal di latar belakang (background cron)
│       └── jobs/             # jobs: audit cleanup, session pruning, self-ping
│
├── pkg/                      # Pustaka internal yang dapat digunakan kembali (reusable)
│   ├── database/             # Pembuat koneksi pool PostgreSQL
│   ├── logger/               # Konfigurasi runtime perekaman log zerolog
│   ├── response/             # Format pembungkus response sukses dan error API
│   ├── token/                # Utility pembuatan dan verifikasi JWT token
│   └── validator/            # Custom validator struct tags
│
├── migrations/               # Skema migrasi SQL versi terurut (up/down)
├── tests/                    # Pengujian fungsional terintegrasi
│   └── e2e/                  # End-to-end tests untuk seluruh endpoint API
├── docs/                     # Dokumentasi API spesifikasi OpenAPI 3.0 / Swagger UI
│
├── Dockerfile                # Multi-stage production Docker build
├── render.yaml               # Blueprint Render infrastructure-as-code
├── .env.example              # Contoh cetakan variabel lingkungan
├── Makefile                  # Perintah otomatisasi pembangunan dan pengujian proyek
└── README.md
```

---

## 🛠️ Fitur Teknis Utama (Mendalam)

### 1. Sistem Keamanan & Autentikasi Dual-Token
Backend mengimplementasikan pengamanan tingkat tinggi menggunakan skema rotasi token:
* **Access Token**: Berumur pendek (15 menit), dikirimkan di header HTTP `Authorization: Bearer <token>`.
* **Refresh Token**: Berumur panjang (7 hari), disimpan secara aman dan digunakan hanya untuk memperbarui access token baru saat sudah kedaluwarsa.
* **Token Rotation (RTR)**: Setiap kali refresh token digunakan, server mendeteksi pencurian token potensial dengan menerbitkan pasangan kunci baru dan membatalkan kunci lama secara otomatis.

### 2. Multi-tenancy & Data Isolation
Platform didesain untuk melayani banyak organisasi mahasiswa secara bersamaan secara aman (*SaaS platform ready*).
* Setiap entitas data (Divisi, Tugas, Transaksi, Anggota) secara wajib memiliki atribut `organization_id`.
* Setiap *middleware* autentikasi mengekstrak data ID Organisasi pengguna dari payload JWT.
* Semua kueri GORM ke database secara paksa difilter menggunakan parameter `organization_id` tersebut.
* Jika pengguna A dari organisasi B mencoba menebak ID tugas milik organisasi C, server akan membalas dengan status `404 Not Found` (mencegah enumerasi data internal).

### 3. Perhitungan Keuangan Aman (`valueobject.Money`)
Untuk mencegah galat kalkulasi nilai desimal (khas pada tipe data floating point `float64` dalam pengolahan mata uang), backend menerapkan pola khusus:
* Uang disimpan dalam representasi integer terkecil (Cents, atau Rupiah tanpa koma desimal).
* Entitas `Transaction` didukung oleh tipe terstruktur `Money` yang memvalidasi nominal transaksi agar tidak bernilai negatif tanpa tanda eksplisit dan memiliki standarisasi mata uang (IDR).
* Kalkulasi penjumlahan dan pengurangan kas organisasi dijamin 100% presisi di level basis data dan komputasi memori.

### 4. Struktur Divisi & Alokasi Anggota Dinamis
* Mendukung organisasi dengan banyak divisi internal.
* Pembuatan divisi baru tervalidasi secara unik per organisasi.
* Penugasan dan pemindahan anggota ke dalam divisi tertentu dilakukan melalui pengecekan ketersediaan akun anggota di organisasi tersebut (mencegah penugasan lintas tenant).

### 5. Audit Logging Otomatis
* Setiap aksi administratif (seperti perubahan anggaran, penghapusan divisi, atau perubahan peran anggota) direkam ke dalam tabel `audit_logs`.
* Mencatat pelaku (`user_id`), nama organisasi (`organization_id`), jenis tindakan (`action`), entitas sasaran (`entity_name` & `entity_id`), alamat IP asal, dan waktu kejadian.
* Berguna untuk menjaga transparansi dan meminimalkan penyalahgunaan kekuasaan admin.

### 6. Background Jobs Scheduler (Cron)
Tugas latar belakang berjalan secara otomatis setiap hari untuk menjaga performa basis data:
* **Daily session cleanup (02:00)**: Menghapus sesi refresh token yang sudah kedaluwarsa lebih dari 7 hari.
* **Daily audit cleanup (02:30)**: Menghapus log audit yang sudah berusia lebih dari 90 hari untuk menghemat penyimpanan.
* **Self-Ping Job (14 menit)**: Melakukan ping mandiri ke `SELF_PING_URL` jika diaktifkan (menghindari mode tidur paksa pada layanan hosting gratis seperti Render Free Tier).

---

## 🚀 Panduan Memulai Inisialisasi

### Prasyarat Lokal
* **Go SDK**: Versi 1.26 atau lebih baru.
* **PostgreSQL**: Versi 16 atau lebih tinggi.
* **Docker**: Diperlukan jika Anda ingin menjalankan database instan atau menjalankan tes integrasi via Testcontainers.
* **Make Utility**: Opsional, namun sangat disarankan untuk menjalankan shortcut build.

### Instalasi Langkah Demi Langkah
1. **Unduh alat bantu pengembangan**:
   ```bash
   make install-tools
   ```
2. **Siapkan konfigurasi `.env`**:
   ```bash
   cp .env.example .env
   # Edit berkas .env Anda. Pastikan untuk mengisi nilai JWT_SECRET dengan string acak minimal 32 karakter!
   ```
3. **Jalankan database PostgreSQL (jika belum ada)**:
   ```bash
   docker run --name sekre-pg -p 5432:5432 \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=yourpass \
     -e POSTGRES_DB=sekre_db \
     -d postgres:16-alpine
   ```
4. **Jalankan Migrasi Database**:
   ```bash
   make migrate
   ```
5. **Jalankan Data Simulasi Demo (Opsional)**:
   ```bash
   make db-seed
   ```
6. **Mulai Server API**:
   ```bash
   make run
   ```

Pusat REST API akan aktif melayani request di **http://localhost:8080** (atau port alternatif sesuai pengaturan berkas `.env` Anda).

---

## 🧪 Strategi Pengujian (Testing Suite)

Pengujian dibagi menjadi 3 kategori demi keseimbangan kecepatan eksekusi dan keandalan skenario dunia nyata:

| Jenis Tes | Penanda (Tags) | Durasi Rata-rata | Deskripsi |
|-----------|----------------|------------------|-----------|
| **Unit Test** | Tanpa tag | < 1 detik | Menguji fungsi internal murni, kalkulasi matematika uang, dan parser middleware menggunakan tiruan (mocks). |
| **Integration Test** | `-tags=integration` | ~5 detik | Menguji kueri database SQL nyata terhadap instansi PostgreSQL yang diangkat instan di Docker via Testcontainers. |
| **End-to-End Test** | `-tags=e2e` | ~10 detik | Memulai server HTTP API secara penuh dan menembakkan request HTTP eksternal ke seluruh endpoint untuk memvalidasi alur integrasi menyeluruh. |

Menjalankan pengujian lewat terminal:
```bash
# Menjalankan seluruh paket pengujian
make test

# Menjalankan unit test saja (cepat)
make test-unit

# Menjalankan integration test (butuh Docker)
make test-integration

# Memeriksa cakupan coverage kode (Wajib lolos batas minimal 60%)
make test-cover
make test-cover-check
```

---

## ⚙️ Variabel Lingkungan Penting

Berikut adalah variabel lingkungan kunci yang harus diperhatikan:

| Variabel | Default | Catatan Penting |
|----------|---------|-----------------|
| `SERVER_ENV` | `development` | Atur ke `production` untuk mengaktifkan validasi CORS ketat dan proteksi SSL. |
| `SERVER_PORT` | `8080` | Port tempat API server mendengarkan koneksi. |
| `DB_HOST` | `localhost` | Alamat host database PostgreSQL. |
| `DB_PORT` | `5432` | Port database PostgreSQL. |
| `DB_NAME` | `sekre_db` | Nama database untuk penyimpanan data. |
| `DB_SSLMODE` | `disable` | Wajib diatur ke `require` saat dideploy ke server produksi. |
| `JWT_SECRET` | *(Kosong)* | Kunci rahasia untuk tanda tangan JWT. Harus diganti demi alasan keamanan! |
| `LOG_LEVEL` | `info` | Tingkat keparahan log (`debug`, `info`, `warn`, `error`). |
| `CORS_ALLOWED_ORIGINS` | `*` | Daftar origin web client yang diizinkan melakukan interaksi API (dipisahkan tanda koma). |

---

## 🌍 Alur Logika Fitur (Perspektif Teknis & Bisnis)

Berikut penjelasan sederhana bagaimana masing-masing modul bekerja untuk menjamin keutuhan dan kegunaan aplikasi:

### 💼 1. Autentikasi, Registrasi, dan Alur Multi-tenant
```text
[Guest User]
   │
   ├─► Register Org & Owner ──► Buat baris baru di tabel `organizations` & `users`
   │                            dengan peran OWNER pada `members`.
   │
   └─► Login Akun ────────────► Cocokkan hash Bcrypt password di DB ──► Terbitkan Access
                                & Refresh Token ──► Simpan sidik jari sesi di DB.
```
* Setiap request selanjutnya wajib melampirkan Access Token.
* Middleware autentikasi mengekstrak `user_id`, `organization_id`, dan `role` lalu menyelipkannya ke dalam konteks request (`context.Context`).
* Logika bisnis di usecase membaca data ini dari context sehingga isolasi multi-tenant dijamin 100% aman sejak dari gerbang HTTP paling depan.

### 👥 2. Manajemen Anggota & Struktur Organisasi
* Pengurus dengan peran `OWNER` atau `ADMIN` dapat mengundang anggota baru dengan mengirimkan alamat email sasaran.
* Undangan akan disimpan sebagai baris `Member` dengan status terundang. Anggota dapat login untuk mengaktifkan statusnya.
* Perubahan peran (`OWNER` ➔ `ADMIN` ➔ `MEMBER`) divalidasi dengan ketat: hanya `OWNER` yang boleh mengubah hak akses `ADMIN` atau memindahkan hak kepemilikan organisasi (`OWNER` transfer).
* Penghapusan anggota akan memutuskan relasi data keanggotaan namun mempertahankan riwayat tugas dan transaksi keuangan lama (menjadi relasi anonim) demi menjaga konsistensi audit keuangan organisasi.

### 📋 3. Penugasan Kerja (Task Management)
* Pengurus dapat membuat tugas, menulis tenggat waktu (deadline), menetapkan tingkat prioritas (`LOW`, `MEDIUM`, `HIGH`), dan menunjuk penanggung jawab (`assignee_id`).
* Pengguna yang ditunjuk akan menerima notifikasi status.
* Status tugas dapat bertransisi secara berurutan: `TODO` (belum dikerjakan) ➔ `IN_PROGRESS` (sedang dikerjakan) ➔ `DONE` (selesai).
* Setiap transisi status dicatat dan diverifikasi apakah penanggung jawab atau admin yang merubahnya.

### 💰 4. Transaksi Keuangan (Finance Ledger)
* Transaksi wajib mencantumkan nominal uang, tipe transaksi (`INCOME` untuk kas masuk, `EXPENSE` untuk kas keluar), kategori transaksi (misalnya: Konsumsi, Logistik, Dana Usaha), serta bukti deskripsi penjelasan.
* Nominal transaksi keuangan dipaksa tervalidasi menggunakan format integer desimal penuh.
* Log audit otomatis dibuat untuk mencatat siapa admin yang menginput transaksi tersebut guna mencegah kecurangan laporan keuangan di lingkup internal organisasi mahasiswa.
