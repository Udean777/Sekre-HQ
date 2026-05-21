# 📱 Sekre Mobile

**React Native app untuk platform manajemen organisasi kampus Sekre.**

[![React Native](https://img.shields.io/badge/React_Native-0.85.3-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green?style=flat)](https://reactnative.dev/)

---

## ✨ Fitur

| Modul        | Fitur                                               |
| ------------ | --------------------------------------------------- |
| 🔐 Auth      | Login, Register, Refresh token otomatis, Logout     |
| 📊 Dashboard | Statistik organisasi, info plan, ringkasan tugas    |
| 📋 Tasks     | CRUD tugas, filter status/prioritas, advance status |
| 👥 Members   | Undang anggota, kelola peran, hapus anggota         |
| 🏢 Divisions | CRUD divisi, kelola anggota divisi                  |
| 📅 Events    | CRUD acara, filter & search                         |
| 💰 Finance   | Transaksi CRUD, summary income/expense/balance      |
| ⚙️ Settings  | Edit profil, ganti password, pengaturan organisasi  |

---

## 🏗️ Arsitektur

Clean Architecture dengan 4 layer:

```
core/domain        ← Entities, branded types, domain errors
core/usecases      ← Business logic, use case classes
core/ports         ← Repository interfaces (contracts)
data               ← DTOs, mappers, repository implementations, HTTP client
presentation       ← Screens, components, theme
```

### Dependency flow

```
presentation → hooks → usecases → ports ← data
                                        ↑
                                    di/container
```

### State management

| Concern                    | Tool                             |
| -------------------------- | -------------------------------- |
| Server state (fetch/cache) | TanStack Query v5                |
| Client state (auth, UI)    | Redux Toolkit                    |
| Persistence                | redux-persist + MMKV             |
| Token storage              | react-native-mmkv v3 (encrypted) |
| Encryption key             | react-native-keychain            |

---

## 🛠️ Tech Stack

- **Framework:** React Native 0.85.3 (Community CLI)
- **Language:** TypeScript 5.7.3 (strict mode)
- **Package manager:** bun
- **Navigation:** React Navigation v7 (native-stack + bottom-tabs)
- **State:** Redux Toolkit + TanStack Query v5
- **Storage:** react-native-mmkv v3 + redux-persist
- **Security:** react-native-keychain (iOS Keychain / Android Keystore)
- **Forms:** react-hook-form + Zod v4
- **HTTP:** Axios (dengan auth + refresh interceptors)
- **i18n:** i18next + react-i18next (id-ID default)
- **Animations:** react-native-reanimated v4
- **Splash:** react-native-bootsplash

---

## 📁 Struktur Direktori

```
src/
├── app/
│   ├── navigation/          # RootNavigator, AppNavigator, stack navigators
│   └── providers/           # ReduxProvider, QueryProvider
├── core/
│   ├── domain/
│   │   ├── entities/        # User, Organization, Task, Member, Division, Event, Transaction
│   │   └── errors/          # DomainError hierarchy
│   ├── ports/               # IAuthRepository, ITaskRepository, ...
│   └── usecases/            # auth/, tasks/, members/, divisions/, events/, finance/
├── data/
│   ├── dto/                 # Request/response DTO shapes (snake_case)
│   ├── http/                # Axios client, endpoints, interceptors
│   ├── mappers/             # DTO ↔ entity mappers
│   ├── repositories/        # Repository implementations
│   └── storage/             # MmkvTokenStorage, KeychainService
├── di/
│   └── container.ts         # Repository singletons
├── hooks/
│   ├── auth/                # useLoginMutation, useUpdateProfileMutation, ...
│   ├── tasks/               # useTasksQuery, useCreateTaskMutation, ...
│   ├── members/             # ...
│   ├── divisions/           # ...
│   ├── events/              # ...
│   ├── finance/             # useTransactionsQuery, useFinanceSummaryQuery, ...
│   └── ui/                  # useToast
├── presentation/
│   ├── components/          # Button, Input, Card, Badge, Skeleton, EmptyState, Toast, ...
│   ├── screens/             # auth/, dashboard/, tasks/, members/, divisions/, events/, finance/, settings/
│   └── theme/               # colors, spacing, typography, radius
├── shared/
│   ├── i18n/                # i18next setup, translations
│   └── utils/               # Zod schemas (auth, task, member, division, event, finance, settings)
└── store/
    ├── slices/              # authSlice, uiSlice
    └── index.ts             # Redux store + persist config
```

---

## 🚀 Setup

### Prerequisites

```bash
✓ Node.js 18+
✓ bun
✓ Android Studio (untuk Android)
✓ Xcode 15+ (untuk iOS, macOS only)
✓ CocoaPods (untuk iOS)
```

### Install dependencies

```bash
cd sekre-mobile
bun install

# iOS only
cd ios && pod install && cd ..
```

### Environment

Buat file `.env` di root `sekre-mobile/`:

```env
API_BASE_URL=http://10.0.2.2:8080/api/v1   # Android emulator
# API_BASE_URL=http://127.0.0.1:8080/api/v1  # iOS simulator
```

### Jalankan

```bash
# Start Metro bundler
bun start

# Android
bun android

# iOS
bun ios
```

---

## 🔑 Konfigurasi Penting

### API Base URL

| Platform         | URL                                                        |
| ---------------- | ---------------------------------------------------------- |
| Android emulator | `http://10.0.2.2:8080/api/v1`                              |
| iOS simulator    | `http://127.0.0.1:8080/api/v1`                             |
| Device fisik     | IP lokal mesin dev, misal `http://192.168.1.x:8080/api/v1` |

### Token Storage

Token disimpan di MMKV terenkripsi. Encryption key diambil dari:

1. **iOS** — Keychain (via `react-native-keychain`)
2. **Android** — Android Keystore (via `react-native-keychain`)
3. **Fallback** — hardcoded key (development only, tidak aman untuk production)

---

## 🧩 Komponen Shared

| Komponen         | Deskripsi                                                             |
| ---------------- | --------------------------------------------------------------------- |
| `Button`         | Primary, secondary, ghost, danger — dengan loading state              |
| `Input`          | Text input dengan label, error, dan secure entry                      |
| `Card`           | Container dengan shadow dan border                                    |
| `AppText`        | Typography dengan variant (h1–h4, bodyMd, bodySm, label)              |
| `Badge`          | Status badge dengan variant (success, warning, danger, info, primary) |
| `Screen`         | Safe area wrapper dengan optional scroll dan padding                  |
| `Divider`        | Horizontal separator                                                  |
| `SkeletonList`   | Loading placeholder dengan shimmer animation                          |
| `EmptyState`     | Empty list state dengan icon, title, description, dan CTA             |
| `ToastContainer` | Animated toast notifications (success/error/warning/info)             |
| `ErrorBoundary`  | Global error boundary dengan fallback UI                              |

---

## 🔐 RBAC

| Role     | Akses                                              |
| -------- | -------------------------------------------------- |
| `OWNER`  | Full access — semua fitur termasuk edit organisasi |
| `ADMIN`  | Kelola member, divisi, tugas, acara, transaksi     |
| `MEMBER` | Read-only di sebagian besar fitur, bisa buat tugas |

Role disimpan di JWT dan di Redux state (`auth.role`). UI menyembunyikan action button berdasarkan role.

---

## 📝 Type Check

```bash
bunx tsc --noEmit
```

Harus 0 error sebelum commit.

---

## 🔄 Conventional Commits

Format: `type(scope): description`

```bash
feat(mobile): implement finance module
fix(mobile): resolve token refresh race condition
refactor(mobile): extract skeleton to shared component
```
