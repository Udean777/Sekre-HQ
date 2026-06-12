# AGENTS.md — Sekre Mobile

Dokumen ini adalah panduan wajib bagi semua AI yang bekerja pada proyek `sekre-mobile`.
Baca dan patuhi semua aturan di bawah ini **sebelum** menulis satu baris kode pun.

> **Penting:** Expo SDK 56 adalah versi yang digunakan. Selalu baca dokumentasi versi yang tepat di https://docs.expo.dev/versions/v56.0.0/ sebelum menggunakan API Expo.

---

## 1. Tech Stack

| Kategori             | Library/Tool                                      | Versi  |
|----------------------|---------------------------------------------------|--------|
| Runtime              | React Native + Expo                               | SDK 56 |
| Router/Navigation    | `expo-router`                                     | ~56.2  |
| UI Styling           | NativeWind (TailwindCSS v3)                       | ^4.2   |
| HTTP Client          | Axios                                             | ^1.17  |
| State Management     | Zustand                                           | ^5.0   |
| Server State         | TanStack Query (`@tanstack/react-query`)          | ^5.101 |
| Form Management      | React Hook Form + `@hookform/resolvers`           | ^7.78  |
| Validation Schema    | Zod                                               | ^4.4   |
| Secure Storage       | `expo-secure-store`                               | ~56.0  |
| UI Components        | `@expo/ui`, `expo-image`, `expo-symbols`          | ~56.0  |
| Animations           | `react-native-reanimated`                         | ^4.4   |
| Language             | TypeScript (strict)                               | ~6.0   |
| Package Manager      | Bun                                               | latest |

---

## 2. Arsitektur — Clean Architecture

Proyek ini menggunakan **Clean Architecture** dengan 3 lapisan (_layers_) yang **tidak boleh dilanggar urutan dependensinya**.
Arah ketergantungan wajib: `Presentation → Data → Domain`.
`Domain` **tidak boleh** mengimpor dari layer manapun.

```
src/
├── app/                     # Presentation Layer (Expo Router screens & layouts)
│   ├── (app)/               # Grup rute untuk pengguna yang sudah login
│   │   └── _layout.tsx      # Layout navigator untuk rute terproteksi
│   ├── (auth)/              # Grup rute untuk autentikasi (login, register)
│   └── _layout.tsx          # Root layout, berisi AuthGuard
│
├── components/              # Komponen UI yang dapat digunakan kembali
│   └── ui/                  # Komponen UI generik (Avatar, Button, Input, dst.)
│
├── hooks/                   # Custom Hooks — orkestrasi TanStack Query & logika UI
│   ├── use-auth.ts          # Mutasi login, register, logout
│   └── use-tasks.ts         # Query daftar tugas dengan filter & caching
│
├── core/                    # Infrastruktur inti (tidak bergantung pada fitur)
│   ├── config/
│   │   └── api.ts           # URL base, endpoint constants
│   ├── network/
│   │   └── api-client.ts    # Axios instance + request/response interceptors (JWT refresh)
│   ├── storage/
│   │   └── secure-storage.ts # Abstraksi Expo SecureStore
│   ├── store/
│   │   └── use-auth-store.ts # Global auth state (Zustand) — session, user, org, role
│   └── validations/
│       └── auth.validation.ts # Zod schemas untuk validasi form auth
│
├── data/                    # Data Layer — implementasi repositori & model API
│   ├── models/              # DTO (Data Transfer Objects) — struktur respons API
│   │   ├── auth.dto.ts
│   │   └── task.dto.ts
│   └── repositories/        # Implementasi konkrit dari domain repository interfaces
│       ├── auth.repository.impl.ts
│       └── task.repository.impl.ts
│
└── domain/                  # Domain Layer — murni, tanpa dependensi eksternal
    ├── entities/            # Definisi tipe entitas bisnis
    │   ├── organization.entity.ts
    │   ├── task.entity.ts
    │   └── user.entity.ts
    └── repositories/        # Kontrak (interface) repositori
        ├── auth.repository.ts
        └── task.repository.ts
```

---

## 3. Prinsip Wajib (SOLID + Clean Code)

### 3.1 Single Responsibility Principle (SRP)
- Setiap file, komponen, dan hook hanya memiliki **satu alasan untuk berubah**.
- Komponen UI hanya bertanggung jawab untuk **rendering**.
- Hooks (`use-*.ts`) hanya bertanggung jawab untuk **orkestrasi state dan side-effects**.
- Repository hanya bertanggung jawab untuk **komunikasi data (API/Storage)**.

### 3.2 Open-Closed Principle (OCP)
- `apiClient` (Axios) dapat diperluas perilakunya melalui `interceptors` **tanpa memodifikasi** implementasi di setiap repository.
- Gunakan pola ini untuk fitur cross-cutting seperti auth header, logging, dan error normalization.

### 3.3 Interface Segregation Principle (ISP)
- Setiap interface repositori di `src/domain/repositories/` hanya mendefinisikan method yang **benar-benar dibutuhkan** oleh fitur yang bersangkutan.
- Jangan buat satu interface `BaseRepository` raksasa yang memiliki semua method CRUD.

### 3.4 Dependency Inversion Principle (DIP)
- Layer `domain` hanya tahu tentang kontrak (interface), **bukan** implementasi.
- Layer `hooks` dan `components` **bergantung pada abstraksi**, bukan implementasi konkrit.
- Untuk React Native, pendekatan _singleton export_ (`export const repo = new RepoImpl()`) adalah kompromi pragmatis yang dapat diterima.

### 3.5 Aturan Clean Code
- Gunakan nama yang **deskriptif dan ekspresif** (misalnya `isAuthenticated`, `loadingPending`, bukan `flag`, `l`).
- Hindari magic number/string. Gunakan konstanta dari `src/core/config/api.ts`.
- Fungsi tidak boleh melebihi **30 baris**. Jika melebihi, pisah menjadi fungsi helper.
- Tidak ada logika bisnis di dalam komponen UI. Extrak ke hooks.
- Selalu gunakan **optional chaining** (`?.`) saat mengakses data dari API untuk menghindari runtime error.

---

## 4. Konvensi Expo SDK 56

### 4.1 Navigasi (expo-router ~56.2)
- Gunakan **file-based routing** sesuai struktur di `src/app/`.
- Rute terproteksi (post-login) berada di grup `(app)/`, rute publik di `(auth)/`.
- Gunakan `<Stack>` untuk navigasi stack antar layar.
- Proteksi rute diimplementasikan via `AuthGuard` component di `src/app/_layout.tsx`.
- Gunakan `useRouter()` dan `useSegments()` untuk navigasi programatik.

### 4.2 Layout Aman
- Selalu bungkus layar dengan `<SafeAreaView>` dari `react-native-safe-area-context`.
- Jangan gunakan `SafeAreaView` dari `react-native` langsung.

### 4.3 Secure Storage
- **Semua token** (access_token, refresh_token) harus disimpan di `SecureStorage` (abstraksi `expo-secure-store`), **bukan** di AsyncStorage atau state biasa.
- Gunakan wrapper `src/core/storage/secure-storage.ts` — **jangan** panggil `expo-secure-store` secara langsung dari luar `core/`.

### 4.4 Styling (NativeWind v4)
- Gunakan **NativeWind className** untuk semua styling. **Jangan** gunakan `StyleSheet.create()` untuk komponen baru.
- Pallete warna yang disarankan: `gray-*`, `blue-*`, `orange-*`, `red-*` sesuai yang sudah digunakan di Dashboard.
- Untuk komponen yang perlu style dinamis (conditional), gunakan template literal atau conditional object.

### 4.5 Animasi
- Gunakan `react-native-reanimated` v4 untuk animasi berbasis Worklet.
- Jangan gunakan `Animated` API dari `react-native` (deprecated patterns).

---

## 5. Konvensi Penamaan File & Komponen

| Artefak                    | Konvensi                              | Contoh                            |
|----------------------------|---------------------------------------|-----------------------------------|
| Screen/Page                | `kebab-case.tsx`                      | `task-detail.tsx`                 |
| Komponen UI                | `PascalCase.tsx`                      | `TaskCard.tsx`                    |
| Custom Hook                | `use-kebab-case.ts`                   | `use-tasks.ts`                    |
| Repository Interface       | `kebab-case.repository.ts`            | `task.repository.ts`              |
| Repository Implementation  | `kebab-case.repository.impl.ts`       | `task.repository.impl.ts`         |
| Entity                     | `kebab-case.entity.ts`                | `task.entity.ts`                  |
| DTO                        | `kebab-case.dto.ts`                   | `task.dto.ts`                     |
| Validation Schema          | `kebab-case.validation.ts`            | `auth.validation.ts`              |
| Store                      | `use-kebab-case-store.ts`             | `use-auth-store.ts`               |

---

## 6. Pola Pengembangan Fitur Baru

Ikuti urutan ini setiap kali membuat fitur baru (contoh: fitur `Members`):

1. **Domain Layer:**
   - Buat `src/domain/entities/member.entity.ts`
   - Buat `src/domain/repositories/member.repository.ts` (interface saja)

2. **Data Layer:**
   - Buat `src/data/models/member.dto.ts` (jika ada DTO khusus)
   - Buat `src/data/repositories/member.repository.impl.ts`

3. **Core/Validation:**
   - Jika ada form, buat `src/core/validations/member.validation.ts` (Zod schema)

4. **Presentation Layer:**
   - Buat custom hook di `src/hooks/use-members.ts` menggunakan TanStack Query
   - Buat komponen UI di `src/components/ui/` jika ada komponen yang reusable
   - Buat screen di `src/app/(app)/members/` (dengan `index.tsx`, `[id].tsx`, dst.)

---

## 7. Pola Data Fetching (TanStack Query)

```typescript
// Pola query keys yang terstruktur — ikuti pola ini
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

// Hook query — selalu beri guard `enabled: isAuthenticated`
export const useTasks = (filters: TaskFilters = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskRepository.listTasks(filters),
    enabled: isAuthenticated,
  });
};

// Hook mutasi — selalu invalidate query yang relevan setelah berhasil
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskDTO) => taskRepository.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};
```

---

## 8. Struktur Respons API Backend

Backend Golang menggunakan format respons yang konsisten:

```json
// Respons sukses (single object)
{ "success": true, "message": "...", "data": { ... } }

// Respons paginasi
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5
  }
}
```

- Untuk mengakses data, selalu gunakan `response.data.data` (bukan `response.data`).
- Field paginasi ada di `response.data.pagination.total_items`.
- Endpoint base: `EXPO_PUBLIC_API_URL` (dari `.env`) + `/api/v1`.
- Lihat semua konstanta endpoint di `src/core/config/api.ts`.

---

## 9. Hal-hal yang Dilarang (Anti-Patterns)

- ❌ **Jangan** meletakkan logika `fetch/axios` langsung di dalam komponen atau screen.
- ❌ **Jangan** gunakan `useEffect` + `useState` untuk data fetching. Gunakan TanStack Query.
- ❌ **Jangan** simpan token di `AsyncStorage`. Gunakan `SecureStorage`.
- ❌ **Jangan** impor implementasi konkrit dari `data/` ke dalam komponen `app/` secara langsung. Muat melalui hooks.
- ❌ **Jangan** gunakan `StyleSheet.create()` untuk komponen baru. Gunakan NativeWind.
- ❌ **Jangan** buat satu file validasi raksasa. Pisah per domain/fitur di `core/validations/`.
- ❌ **Jangan** hardcode URL atau endpoint di luar `src/core/config/api.ts`.
- ❌ **Jangan** mengimpor library apapun di layer `domain/`. Layer ini harus bebas dependensi eksternal.
- ❌ **Jangan** buat komponen bawaan Expo baru (`themed-text`, `themed-view`, dll.). Gunakan komponen yang ada di `src/components/ui/`.
