# **🏢 Organization ERP Lite & Finance Hub (SaaS)**

Sebuah platform *Software as a Service* (SaaS) multi-tenant yang dirancang untuk membantu organisasi, komunitas, dan himpunan mahasiswa dalam mengelola operasional harian. Sistem ini mengintegrasikan manajemen tugas, penjadwalan kegiatan, dan pelaporan keuangan cerdas dengan dukungan otomatisasi AI.

## **🛠️ Tech Stack Architecture**

Arsitektur menggunakan pendekatan **Decoupled Client-Server** dengan pemisahan platform yang dioptimalkan sesuai dengan kekuatannya masing-masing.

* **Backend (Core API & Logic):** Golang (arsitektur *Modular Monolith*).  
* **Database:** PostgreSQL (manajemen data relasional *multi-tenant* dengan *Row-Level Security*).  
* **Message Broker (Async Task):** Redis (menggunakan *library* Asynq untuk antrean AI).  
* **Web Frontend (SaaS Dashboard & Admin):** SvelteKit (SSR untuk performa *dashboard* maksimal).  
* **Mobile App (Android & iOS):** Compose Multiplatform (memberikan fungsionalitas *native* & responsif di lapangan).  
* **AI Integration:** LLM (OpenAI/Gemini/Local LLM) terintegrasi via *worker* Golang.

## **🚀 Roadmap & Features Breakdown**

### **Fase 1: Minimum Viable Product (MVP) \- The Core Free Plan**

Fokus utama murni pada kelancaran operasional internal harian organisasi. Menjadi *hook* untuk akuisisi pengguna (Maksimal 7 Divisi, 15 Anggota/Divisi).

1. **Multi-Tenant Auth & Setup:** Pendaftaran organisasi mandiri dengan struktur hierarki divisi.  
2. **Task Management (Kanban):** Papan kerja visual (*To-Do, In Progress, Done*) dan delegasi tugas spesifik ke anggota.  
3. **Event Timeline:** Kalender operasional untuk penjadwalan program kerja atau acara rutin.  
4. **Basic Finance Tracker:** Pencatatan manual kas masuk divisi dan pengeluaran operasional (tanpa hierarki *approval*).

### **Fase 2: Monetization & Advanced Features (Paid Plans)**

Fokus pada akuntabilitas, otomatisasi birokrasi, dan identitas tingkat lanjut.

**Lite Plan (The Booster)** \- Maks. 15 Divisi, 30 Anggota/Divisi

* **Smart Finance Hub:** Sistem *approval* berjenjang (Anggota \-\> Ketua Divisi) dan alokasi limit *budget* per program kerja.  
* **✨ AI-Generated LPJ:** Eksekusi otomatis penyusunan Laporan Pertanggungjawaban (PDF). AI merangkum *task*, pengeluaran, dan foto acara via *background worker* (Redis).  
* **Data Export:** Unduh rekap keuangan dan performa anggota ke CSV/Excel.

**Pro Plan (Scale & Identity)** \- Unlimited Divisi & Anggota

* **Auto-Generated Public Page & Custom Branding:** Pembuatan *landing page* profil organisasi otomatis untuk publik dengan dukungan *Custom Domain* (contoh: www.organisasiku.org).  
* **Cloud Storage:** Arsip digital untuk dokumen legal, proposal, dan foto dokumentasi resolusi tinggi.  
* **Advanced Analytics:** *Dashboard* visual perbandingan performa lintas divisi dan rasio serapan anggaran.

## **🏛️ System Architecture Details**

### **1\. Backend: Golang (Modular Monolith)**

Menggunakan pendekatan *Clean Architecture* yang dipisah berdasarkan domain modul bisnis.

erp-backend/  
├── cmd/api/main.go                 \# Entry point aplikasi  
├── internal/  
│   ├── middleware/                 \# JWT Auth & Tenant Validator (Isolasi data SaaS)  
│   ├── domain/                     \# Entities & Interfaces murni (organization.go, finance.go)  
│   ├── organization/               \# Modul Organisasi  
│   │   ├── repository/             \# Query PostgreSQL (Data Layer)  
│   │   ├── usecase/                \# Business logic (cek limit 7 divisi)  
│   │   └── delivery/               \# REST API Handlers  
│   └── finance/                    \# Modul Keuangan (Struktur serupa)  
└── pkg/                            \# Global utilities (Response formatter, logger)

### **2\. Frontend Web: SvelteKit (Feature-Sliced Design)**

Menggunakan pendekatan modular yang mengisolasi tampilan, logika bisnis (*stores*), dan pemanggilan API (*services*) berdasarkan fiturnya agar *bundle size* tetap ringan.

erp-frontend/  
├── src/  
│   ├── routes/                     \# Delivery Layer (SvelteKit file-system routing)  
│   │   ├── (public)/               \# Rute publik (untuk Pro Plan Landing Page)  
│   │   └── (app)/                  \# Rute Dashboard internal SaaS terproteksi  
│   └── lib/                          
│       ├── core/                   \# Global API config & Session stores  
│       ├── components/             \# Reusable UI (Buttons, Tables, Modals)  
│       └── features/               \# Domain & Usecase Layer  
│           ├── finance/  
│           │   ├── services.ts     \# Pemanggilan API endpoint Golang  
│           │   ├── stores.ts       \# Logika kalkulasi kas & state management  
│           │   ├── types.ts        \# TypeScript Interfaces  
│           │   └── components/     \# UI khusus fitur keuangan  
│           └── task/               \# Modul manajemen tugas

### **3\. Mobile: Compose Multiplatform (MVI/MVVM)**

Menerapkan *Clean Architecture* di dalam commonMain sehingga 95% kode bisa dijalankan untuk Android dan iOS, dengan penekanan pada fitur *Offline-First*.

erp-mobile/  
└── composeApp/src/commonMain/kotlin/  
    ├── core/                       \# Infrastruktur (Ktor API, Koin DI, Room DB)  
    └── features/                   \# Modular Domain per fitur  
        └── finance/  
            ├── domain/             \# Entitas KMP & Repository Interface  
            ├── data/               \# Remote (Ktor) & Local Cache (Room/SQLDelight)  
            └── presentation/       \# UI Layer & State Management  
                ├── state/          \# ViewModel & StateFlow (MVI/MVVM)  
                └── screens/        \# Komponen Jetpack Compose

## **🗄️ Database Schema (PostgreSQL Multi-Tenant)**

Merancang skema *database* untuk aplikasi SaaS *multi-tenant* membutuhkan ketelitian ekstra. Karena banyak organisasi akan menggunakan satu *database* PostgreSQL yang sama, kita harus memastikan data mereka terisolasi dengan aman agar tidak bocor ke organisasi lain.

Pendekatan terbaik untuk proyek ini adalah **Shared Database, Shared Schema** dengan menerapkan **Row-Level Security (RLS)**. Artinya, hampir setiap tabel akan memiliki kolom organization\_id sebagai kunci pembatas.

Berikut adalah rancangan skema *database* relasional untuk MVP dan fondasi fitur berbayarmu:

### **1\. Entitas Core SaaS & Autentikasi**

Ini adalah fondasi yang membedakan aplikasi biasa dengan SaaS.

**Tabel organizations** (Menyimpan data klien/tenant)

* id (UUID, Primary Key)  
* name (Varchar) \- *Contoh: "HIMTI UNPAB"*  
* subdomain (Varchar, Unique) \- *Contoh: "himti"*  
* subscription\_plan (Enum: 'FREE', 'LITE', 'PRO') \- *Default: 'FREE'*  
* created\_at (Timestamp)

**Tabel users** (Akun global pengguna)

* id (UUID, Primary Key)  
* email (Varchar, Unique)  
* password\_hash (Varchar)  
* full\_name (Varchar) \- *Contoh: "Sajudin Ma’ruf"*

**Tabel organization\_members** (Pivot untuk RBAC tingkat organisasi)

Karena satu *user* bisa saja menjadi anggota di beberapa organisasi yang berbeda.

* organization\_id (UUID, FK ke organizations)  
* user\_id (UUID, FK ke users)  
* role (Enum: 'OWNER', 'ADMIN', 'MEMBER')  
* *Primary Key gabungan (organization\_id, user\_id)*

### **2\. Entitas Operasional (Divisi & Tim)**

Sesuai strategi kita, fitur gratis dibatasi maksimal 7 divisi.

**Tabel divisions**

* id (UUID, Primary Key)  
* organization\_id (UUID, FK ke organizations) \- *Penting untuk isolasi data*  
* name (Varchar) \- *Contoh: "Divisi IPTEK"*  
* created\_at (Timestamp)

**Tabel division\_members** (Pivot untuk RBAC tingkat divisi)

* division\_id (UUID, FK ke divisions)  
* user\_id (UUID, FK ke users)  
* division\_role (Enum: 'HEAD', 'STAFF') \- *Membedakan hak akses Ketua Divisi dan Anggota (misal: Zulhamdani atau Gilang Gemilang)*  
* *Primary Key gabungan (division\_id, user\_id)*

### **3\. Entitas Produktivitas (Task & Event)**

**Tabel tasks** (Untuk Kanban Board)

* id (UUID, Primary Key)  
* organization\_id (UUID, FK) \- *(Opsional tapi disarankan untuk mempercepat query tingkat atas)*  
* division\_id (UUID, FK ke divisions)  
* assignee\_id (UUID, FK ke users) \- *Siapa yang mengerjakan*  
* title (Varchar) \- *Contoh: "Setup proyektor untuk Goes To School"*  
* status (Enum: 'TODO', 'IN\_PROGRESS', 'DONE')  
* due\_date (Timestamp)  
* created\_at (Timestamp)

**Tabel events** (Untuk Kalender Kegiatan)

* id (UUID, Primary Key)  
* division\_id (UUID, FK ke divisions)  
* title (Varchar) \- *Contoh: "Sosialisasi SMK N1 Stabat"*  
* start\_time (Timestamp)  
* end\_time (Timestamp)  
* location (Varchar)

### **4\. Entitas Keuangan (Finance Hub)**

Tabel ini dirancang untuk mendukung transisi mulus dari "Pencatatan Manual" (Free Plan) ke "Sistem Approval" (Lite Plan).

**Tabel transactions**

* id (UUID, Primary Key)  
* division\_id (UUID, FK ke divisions)  
* event\_id (UUID, Nullable, FK ke events) \- *Jika pengeluaran ini terkait acara tertentu, sangat berguna untuk ditarik oleh AI pembuat LPJ nanti*  
* type (Enum: 'INCOME', 'EXPENSE')  
* amount (Decimal/Numeric)  
* description (Text) \- *Contoh: "Pembelian spanduk kegiatan"*  
* status (Enum: 'PENDING', 'APPROVED', 'REJECTED') \- *(Untuk free plan, status ini bisa di-set otomatis menjadi 'APPROVED' oleh backend).*  
* requested\_by (UUID, FK ke users)  
* approved\_by (UUID, Nullable, FK ke users) \- *Siapa ketua divisi/admin yang menyetujui*  
* receipt\_url (Varchar, Nullable) \- *Link gambar struk/nota di Cloud Storage*  
* created\_at (Timestamp)

### **💡 Tips Keamanan Ekstra di PostgreSQL**

Dengan struktur ini, hampir setiap tabel (seperti tasks, events, transactions) terhubung ke division\_id, dan division\_id terhubung ke organization\_id.

Untuk memastikan tidak ada data yang tertukar, kamu bisa memanfaatkan fitur **Row-Level Security (RLS)** bawaan PostgreSQL. Dengan RLS, meskipun ada bug di kode Golang kamu yang tanpa sengaja melakukan SELECT \* FROM tasks, PostgreSQL akan secara otomatis memblokir *query* tersebut jika *context token user* yang sedang mengakses tidak cocok dengan organization\_id yang diizinkan.

## **💳 Payment & Subscription Management**

Untuk mendukung monetisasi Lite dan Pro Plan, sistem membutuhkan integrasi payment gateway yang sesuai dengan target market Indonesia.

### **Payment Gateway Integration**

**Rekomendasi Provider:**
* **Midtrans/Xendit:** Cocok untuk market Indonesia, mendukung berbagai metode pembayaran (VA, e-wallet, kartu kredit).
* **Stripe:** Jika target ekspansi global, dengan dukungan subscription management yang mature.

**Tabel subscriptions** (Tracking langganan aktif)

* id (UUID, Primary Key)
* organization\_id (UUID, FK ke organizations)
* plan (Enum: 'FREE', 'LITE', 'PRO')
* status (Enum: 'ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL')
* billing\_cycle (Enum: 'MONTHLY', 'YEARLY')
* current\_period\_start (Timestamp)
* current\_period\_end (Timestamp)
* payment\_method (Varchar) - *Contoh: "VA BCA", "GoPay"*
* created\_at (Timestamp)

**Tabel payment\_transactions** (History pembayaran)

* id (UUID, Primary Key)
* subscription\_id (UUID, FK ke subscriptions)
* amount (Decimal)
* currency (Varchar) - *Default: "IDR"*
* status (Enum: 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')
* payment\_gateway\_id (Varchar) - *ID transaksi dari Midtrans/Xendit*
* paid\_at (Timestamp, Nullable)
* created\_at (Timestamp)

**Webhook Handler:**
Backend Golang perlu endpoint untuk menerima webhook dari payment gateway untuk update status pembayaran secara real-time dan otomatis upgrade/downgrade plan organisasi.

## **📧 Notification System**

Sistem notifikasi penting untuk engagement dan informasi real-time kepada user.

### **Email Notification**

**Use Cases:**
* Welcome email saat registrasi organisasi
* Notifikasi approval/rejection transaksi keuangan
* Reminder deadline task yang akan jatuh tempo
* Invoice dan receipt pembayaran subscription
* Alert saat subscription akan expired

**Tech Stack:**
* **Transactional Email:** SendGrid/Mailgun/AWS SES
* **Template Engine:** Golang html/template atau external service seperti Maizzle
* **Queue:** Redis + Asynq untuk async email sending (avoid blocking API response)

**Tabel email\_logs** (Audit trail email)

* id (UUID, Primary Key)
* organization\_id (UUID, FK, Nullable)
* user\_id (UUID, FK)
* email\_type (Varchar) - *Contoh: "TASK_REMINDER", "PAYMENT_SUCCESS"*
* recipient\_email (Varchar)
* status (Enum: 'QUEUED', 'SENT', 'FAILED', 'BOUNCED')
* sent\_at (Timestamp, Nullable)
* created\_at (Timestamp)

### **In-App Notification**

**Tabel notifications**

* id (UUID, Primary Key)
* user\_id (UUID, FK ke users)
* organization\_id (UUID, FK ke organizations)
* type (Varchar) - *Contoh: "TASK_ASSIGNED", "TRANSACTION_APPROVED"*
* title (Varchar)
* message (Text)
* reference\_id (UUID, Nullable) - *ID dari task/transaction/event terkait*
* reference\_type (Varchar, Nullable) - *Contoh: "TASK", "TRANSACTION"*
* is\_read (Boolean, Default: false)
* created\_at (Timestamp)

**Real-time Delivery:**
* WebSocket connection untuk web dashboard (SvelteKit)
* Firebase Cloud Messaging (FCM) untuk mobile push notifications

## **📊 Audit Log & Compliance**

Untuk organisasi yang mengelola keuangan, audit trail adalah kebutuhan critical untuk transparansi dan akuntabilitas.

### **Audit Log System**

**Tabel audit\_logs**

* id (UUID, Primary Key)
* organization\_id (UUID, FK ke organizations)
* user\_id (UUID, FK ke users)
* action (Varchar) - *Contoh: "CREATE_TRANSACTION", "APPROVE_EXPENSE", "UPDATE_DIVISION"*
* entity\_type (Varchar) - *Contoh: "TRANSACTION", "TASK", "USER"*
* entity\_id (UUID) - *ID dari entitas yang dimodifikasi*
* old\_values (JSONB, Nullable) - *State sebelum perubahan*
* new\_values (JSONB) - *State setelah perubahan*
* ip\_address (Varchar)
* user\_agent (Text)
* created\_at (Timestamp)

**Indexing Strategy:**
* Index pada (organization\_id, created\_at) untuk query history per organisasi
* Index pada (entity\_type, entity\_id) untuk tracking perubahan spesifik entity

**Retention Policy:**
* Free Plan: 30 hari
* Lite Plan: 90 hari
* Pro Plan: 1 tahun (atau unlimited dengan archive ke cold storage)

## **🤖 AI Cost Optimization Strategy**

AI-Generated LPJ adalah fitur premium yang bisa menjadi cost center jika tidak dikelola dengan baik.

### **Hybrid LLM Approach**

**Tier 1: Local/Open-Source LLM (untuk Free/Lite Plan)**
* Gunakan model seperti Llama 3 atau Mistral yang bisa di-host sendiri
* Deploy di server dengan GPU (atau CPU dengan quantization)
* Cost: Fixed infrastructure cost, tidak per-request
* Trade-off: Kualitas output mungkin sedikit di bawah GPT-4

**Tier 2: Cloud LLM (untuk Pro Plan)**
* OpenAI GPT-4 atau Gemini Pro untuk kualitas maksimal
* Cost: Per-request, tapi dibebankan ke customer premium
* Benefit: Hasil LPJ lebih natural dan comprehensive

### **Optimization Techniques**

1. **Prompt Caching:** Cache prompt template yang sering digunakan
2. **Batch Processing:** Kumpulkan multiple LPJ generation request dan proses sekaligus
3. **Token Limit:** Set max token output untuk kontrol cost (misal: 2000 tokens untuk Lite, 5000 untuk Pro)
4. **Rate Limiting:** Batasi jumlah LPJ generation per bulan per plan (misal: 5x untuk Lite, unlimited untuk Pro)
5. **Incremental Generation:** Generate LPJ per section (Executive Summary → Financial Report → Activity Report) untuk bisa di-cache dan di-reuse

**Tabel ai\_usage\_logs** (Tracking AI consumption)

* id (UUID, Primary Key)
* organization\_id (UUID, FK ke organizations)
* user\_id (UUID, FK ke users)
* feature (Varchar) - *Contoh: "LPJ_GENERATION"*
* model\_used (Varchar) - *Contoh: "gpt-4", "llama-3-70b"*
* tokens\_used (Integer)
* cost\_usd (Decimal, Nullable)
* created\_at (Timestamp)

## **📱 Mobile Offline-First Sync Strategy**

Compose Multiplatform dengan offline-first adalah powerful, tapi butuh strategi sync yang robust untuk avoid data conflict.

### **Conflict Resolution Strategy**

**Last-Write-Wins (LWW) dengan Timestamp**
* Setiap record memiliki updated\_at timestamp
* Saat sync conflict, server timestamp menang
* Cocok untuk: Task updates, event scheduling

**Operational Transform (OT) / CRDT**
* Untuk collaborative editing yang real-time
* Kompleksitas tinggi, consider hanya jika benar-benar butuh
* Alternatif: Lock mechanism untuk prevent concurrent edit

**Manual Conflict Resolution**
* Untuk data critical seperti finance transactions
* Jika conflict terdeteksi, tampilkan UI untuk user memilih versi mana yang benar
* Server reject auto-merge untuk transaction data

### **Sync Architecture**

**Tabel sync\_queue** (Local SQLite di Mobile)

* id (UUID, Primary Key)
* entity\_type (Varchar)
* entity\_id (UUID)
* operation (Enum: 'CREATE', 'UPDATE', 'DELETE')
* payload (JSON)
* retry\_count (Integer, Default: 0)
* status (Enum: 'PENDING', 'SYNCED', 'FAILED')
* created\_at (Timestamp)

**Sync Flow:**
1. User melakukan action offline → Simpan ke local DB + sync\_queue
2. Saat online, background worker process sync\_queue secara batch
3. Server validate + apply changes + return updated\_at timestamp
4. Mobile update local DB dengan server timestamp
5. Jika conflict (server updated\_at > local updated\_at), trigger conflict resolution

**Optimistic UI Updates:**
* Tampilkan perubahan langsung di UI (optimistic)
* Jika sync gagal, rollback + tampilkan error
* Indicator visual untuk data yang belum ter-sync (misal: icon cloud dengan tanda pending)

## **🏗️ Infrastructure & DevOps**

### **CI/CD Pipeline**

**Backend (Golang):**
* GitHub Actions / GitLab CI
* Pipeline: Lint → Test → Build → Docker Image → Deploy
* Environment: Development → Staging → Production
* Database Migration: Automated via golang-migrate atau Goose

**Frontend (SvelteKit):**
* Vercel / Netlify untuk hosting (auto-deploy dari Git)
* Preview deployment untuk setiap PR
* Environment variables management per environment

**Mobile (Compose Multiplatform):**
* Fastlane untuk automated build & deployment
* Android: Google Play Internal Testing → Beta → Production
* iOS: TestFlight → App Store
* Code signing & certificate management via CI secrets

### **Monitoring & Observability**

**Metrics:**
* Prometheus + Grafana untuk system metrics (CPU, memory, request rate)
* Custom business metrics (active organizations, subscription conversions, AI usage)

**Logging:**
* Structured logging dengan Zap (Golang) atau Logrus
* Centralized logging: ELK Stack (Elasticsearch, Logstash, Kibana) atau Loki
* Log levels: DEBUG (dev), INFO (staging), WARN/ERROR (production)

**Tracing:**
* OpenTelemetry untuk distributed tracing
* Jaeger atau Tempo untuk trace visualization
* Critical untuk debug performance issue di microservices (jika scale ke microservices nanti)

**Alerting:**
* PagerDuty / Opsgenie untuk on-call rotation
* Alert rules: High error rate, database connection pool exhausted, payment webhook failures

### **Backup & Disaster Recovery**

**Database Backup:**
* Automated daily backup PostgreSQL (pg\_dump atau continuous archiving dengan WAL)
* Retention: 7 daily, 4 weekly, 12 monthly
* Test restore procedure setiap bulan

**Object Storage Backup:**
* Jika pakai S3/GCS untuk file storage, enable versioning
* Cross-region replication untuk disaster recovery

**RTO & RPO Target:**
* RTO (Recovery Time Objective): < 4 jam
* RPO (Recovery Point Objective): < 1 jam (via WAL archiving)

### **Custom Domain Management (Pro Plan)**

**DNS & SSL Automation:**
* Cloudflare API untuk DNS management
* Automatic SSL certificate provisioning via Let's Encrypt
* CNAME verification flow: User add CNAME record → System verify → Activate custom domain

**Tabel custom\_domains**

* id (UUID, Primary Key)
* organization\_id (UUID, FK ke organizations)
* domain (Varchar, Unique) - *Contoh: "www.himtiunpab.org"*
* verification\_status (Enum: 'PENDING', 'VERIFIED', 'FAILED')
* verification\_token (Varchar) - *Token untuk CNAME verification*
* ssl\_status (Enum: 'PENDING', 'ACTIVE', 'EXPIRED')
* is\_active (Boolean, Default: false)
* created\_at (Timestamp)

**Reverse Proxy:**
* Nginx atau Caddy untuk routing custom domain ke organization's public page
* Dynamic configuration reload saat custom domain baru ditambahkan

## **🎯 Next Steps & Implementation Priority**

### **Phase 0: Foundation (Sebelum MVP)**
1. ✅ Setup Git repository structure (monorepo vs multi-repo)
2. ✅ Design & document API contract (OpenAPI/Swagger spec)
3. ✅ Setup development environment (Docker Compose untuk local dev)
4. ✅ Implement RLS policies di PostgreSQL
5. ✅ Setup CI/CD pipeline basic

### **Phase 1: MVP Development (3-4 bulan)**
1. Backend: Auth, Organization, Division, Task, Event, Basic Finance modules
2. Web Frontend: Dashboard, Kanban board, Calendar, Finance tracker
3. Database: Core tables + RLS implementation
4. Testing: Unit tests + integration tests untuk critical path

### **Phase 2: Beta Testing & Iteration (1-2 bulan)**
1. Deploy ke staging environment
2. Onboard 3-5 organisasi mahasiswa untuk beta testing
3. Collect feedback + iterate
4. Performance optimization + bug fixes

### **Phase 3: Monetization Features (2-3 bulan)**
1. Payment gateway integration (Midtrans/Xendit)
2. AI LPJ generation (mulai dengan local LLM)
3. Email notification system
4. Subscription management dashboard

### **Phase 4: Mobile App (2-3 bulan)**
1. Compose Multiplatform setup
2. Offline-first architecture implementation
3. Sync mechanism + conflict resolution
4. Beta testing via TestFlight & Google Play Internal Testing

### **Phase 5: Scale & Pro Features (3-4 bulan)**
1. Custom domain management
2. Cloud storage integration
3. Advanced analytics dashboard
4. Performance optimization untuk scale

### **Continuous:**
* Monitoring & alerting setup
* Security audit & penetration testing
* Documentation (user guide, API docs, runbook)
* Customer support system