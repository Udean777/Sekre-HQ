# Sekre Mobile - App Architecture Blueprint

Dokumen ini menjelaskan arsitektur perangkat lunak untuk aplikasi mobile **Sekre** (`sekre-mobile`).

## 1. Arsitektur Sistem
- **Framework Utama**: Expo React Native
- **Routing**: Expo Router (*file-based routing*)
- **State Management**: Zustand (untuk *global UI state*) dan TanStack Query (untuk *server state*)
- **HTTP Client**: Axios
- **UI Styling**: Murni menggunakan React Native `StyleSheet`

## 2. Struktur Direktori Utama
Proyek ini mengadopsi **Feature-Sliced Design (FSD)** yang disederhanakan dan dipadukan dengan *Clean Architecture*.

```text
sekre-mobile/
├── app/                        # [EXPO ROUTER] Khusus rute/halaman UI (Presentational)
│   ├── (auth)/                 # Grup routing otentikasi (login, register)
│   ├── (dashboard)/            # Grup routing utama (home, kalender)
│   ├── (finance)/              # Grup routing fitur keuangan
│   ├── (tasks)/                # Grup routing fitur manajemen tugas
│   ├── _layout.tsx             # Root layout & navigasi global
│   └── index.tsx               # Entry point UI
│
├── src/                        # [FEATURE-SLICED DESIGN] Pusat kode & Clean Architecture
│   ├── app/                    # Setup global (Zustand store global, Providers, QueryClient)
│   ├── features/               # Fungsionalitas spesifik per use-case (mengandung useQuery hooks)
│   │   ├── auth/               # Logika login, manajemen session
│   │   ├── finance/            # Logika pencatatan kas, pelaporan
│   │   ├── tasks/              # Logika kanban, update status tugas
│   │   └── divisions/          # Manajemen anggota & divisi
│   ├── entities/               # Entitas Bisnis & Model Data (Domain Layer)
│   │   ├── user/               # Interface User, hooks dasar user
│   │   ├── task/               # Interface Task, perhitungan waktu
│   │   └── transaction/        # Interface Transaction, Money formatting
│   └── shared/                 # Reusable resources (Infrastructure & UI Layer)
│       ├── api/                # Konfigurasi Axios/Fetch interceptors
│       ├── ui/                 # Reusable UI components (Button, Input, Card) dengan StyleSheet
│       ├── lib/                # Helper, utility (date formatter, currency)
│       └── config/             # Environment variables (API URL, token keys)
```

## 3. Aturan Layering & SOLID Principles

**Pemisahan Tanggung Jawab (Separation of Concerns):**
- **Domain Layer (`src/entities`)**: Hanya berisi definisi tipe data (TypeScript Interfaces), Zod schemas (jika butuh validasi), dan *pure functions* yang berhubungan langsung dengan entitas. Tidak bergantung pada UI atau library eksternal.
- **Application Layer (`src/features`)**: Berisi *use cases* berupa React Query hooks (`useMutation`, `useQuery`). Fitur mengambil data dari API, memprosesnya, dan menyiapkannya untuk UI.
- **Infrastructure Layer (`src/shared/api` & `src/shared/lib`)**: Bertanggung jawab untuk komunikasi ke luar (HTTP requests via Axios, akses ke secure storage).
- **Presentation Layer (`app/` & `src/shared/ui`)**: Komponen React murni. Layar di dalam folder `app/` hanya memanggil *hooks* dari `features/` dan menampilkan komponen dari `shared/ui`.
