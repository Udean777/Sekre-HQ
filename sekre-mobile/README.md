# 📱 Sekre Mobile

**Aplikasi Mobile Lintas Platform (Android & iOS) Sekre berbasis React Native & Clean Architecture**

[![React Native](https://img.shields.io/badge/React_Native-0.85.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sentry](https://img.shields.io/badge/Sentry-Monitoring-6C5B7B?style=for-the-badge&logo=sentry&logoColor=white)](https://sentry.io/)
[![Platforms](https://img.shields.io/badge/Platform-Android_%7C_iOS-green?style=for-the-badge)](https://reactnative.dev/)

Sekre Mobile adalah aplikasi mobile klien utama untuk platform Sekre, dibangun menggunakan **React Native 0.85.3** dan **TypeScript**. Aplikasi ini mempermudah seluruh anggota organisasi kemahasiswaan untuk tetap terhubung, melaporkan transaksi kas, merubah progres tugas kepanitiaan, serta melihat jadwal acara organisasi secara instan kapan saja dan di mana saja.

---

## 🛠️ Fitur Teknis Utama (Mobile-Specific)

### 1. Sistem Offline-First & Cache Persistence
Untuk mengantisipasi koneksi internet seluler mahasiswa yang tidak stabil, aplikasi menerapkan arsitektur offline-first:
* **TanStack Query v5 + MMKV Persister**: Menggunakan `@tanstack/react-query-persist-client` yang digabungkan dengan `@tanstack/query-sync-storage-persister` untuk menyimpan seluruh respon API langsung ke dalam memori ultra-cepat **MMKV**.
* **Instant Recovery**: Saat aplikasi dibuka kembali tanpa koneksi internet, data cache langsung dimuat dari penyimpanan lokal MMKV dalam hitungan milidetik sehingga antarmuka tidak membeku di layar kosong.
* **Smart Refetching**: Saat terdeteksi koneksi internet pulih (via `@react-native-community/netinfo`), aplikasi secara otomatis memperbarui data di latar belakang.

### 2. Penyimpanan Kunci Kriptografi & Token Aman
Keamanan data kredensial adalah prioritas utama aplikasi Sekre Mobile:
* **MMKV Encrypted Storage**: Sesi token JWT disimpan lokal di instansi MMKV yang terenkripsi.
* **Keychain Service Integration**: Kunci enkripsi MMKV digenerate secara dinamis dan disimpan di area paling aman pada perangkat:
  * **iOS**: Secure Enclave Keychain (via `react-native-keychain`).
  * **Android**: Android Keystore Provider (via `react-native-keychain`).
  * **Fallback System**: Jika hardware enkripsi perangkat tidak mendukung, sistem menggunakan fallback key khusus untuk lingkungan development.

### 3. Rendering FlatList Ultra Cepat dengan Shopify FlashList
* Mengganti komponen bawaan React Native `FlatList` dengan `@shopify/flash-list`.
* Melakukan daur ulang cell layout (*cell recycling*) untuk menghemat komputasi CPU.
* Menghasilkan frame-rate yang sangat mulus (konstan 60 FPS) tanpa ada lag visual saat melakukan scroll pada daftar tugas panjang maupun ledger kas transaksi organisasi.

### 4. Animasi Mikro & Splash Screen Halus
* **React Native BootSplash**: Menangani masa transisi *cold start* aplikasi (saat inisialisasi modul native) dengan memudar halus (fade-out) ke dashboard tanpa layar putih berkedip.
* **React Native Reanimated v4**: Menggerakkan elemen visual interaktif, feedback animasi klik tombol, notifikasi toast melayang, serta drawer layout secara halus menggunakan perhitungan thread UI native.

### 5. Integrasi Sentry Monitoring & Crash Reporting
* Terintegrasi dengan `@sentry/react-native` untuk melacak galat aplikasi (crashes) secara real-time di produksi.
* Menyediakan script build otomatis (`sentry:upload-android` & `sentry:upload-ios`) untuk mengunggah berkas Source Maps sehingga debug log di dashboard Sentry terbaca dalam kode baris TypeScript murni (bukan kode yang ter-minify).

### 6. Kontrol Anggaran Ukuran Bundle (Bundle Budget System)
Aplikasi memelihara performa startup awal lewat pengawasan ukuran kode:
* **Bundle Budget Checker**: Script custom di `scripts/check-bundle-budget.js` secara otomatis membandingkan ukuran bundle javascript kompilasi rilis terhadap batas anggaran (budget) yang disepakati.
* **Bundle Visualizer**: Terintegrasi `source-map-explorer` untuk merender peta visual distribusi modul aplikasi (`bundle-visualizer-output/android.html` & `ios.html`) guna mengidentifikasi pustaka eksternal yang terlalu besar secara visual.

---

## 🏗️ Pembagian Arsitektur Kode (Clean Architecture)

Aplikasi mobile ini secara ketat membagi komponen kodenya ke dalam 4 lapisan guna menjaga kemudahan penulisan pengujian unit dan penggantian pustaka eksternal:

```
src/
├── core/
│   ├── domain/              # Murni JavaScript/TypeScript: Model Entitas (User, Task), Branded Types, Domain Errors
│   ├── usecases/            # Logika interaksi bisnis (misalnya: Melakukan checkout tugas, Menambah dana kas)
│   └── ports/               # Kontrak antarmuka (Interface) repositori
│
├── data/
│   ├── dto/                 # Representasi format JSON snake_case dari Server API
│   ├── http/                # Klien Axios dengan interceptor auto-refresh token
│   ├── mappers/             # Parser konverter DTO ➔ Entitas Domain (begitu pula sebaliknya)
│   ├── repositories/        # Implementasi repositori konkret pemanggil API / Storage
│   └── storage/             # Pengelola Keychain & MMKV lokal
│
├── presentation/
│   ├── theme/               # Palet warna premium, tipografi kustom, dan ukuran sudut radius
│   ├── components/          # Tombol, input teks, toast, skeleton loader reusable
│   └── screens/             # Layar tampilan antarmuka (Auth, Dashboard, Tasks, Finance, dll)
│
└── store/                   # Pengaturan Redux Toolkit untuk state UI global
```

---

## 📁 Detail Struktur Modul & Layar Aplikasi

Aplikasi mobile mencakup modul layar interaktif sebagai berikut:

* **Auth Module (`presentation/screens/auth`)**: Layar masuk (Login) dan daftar organisasi (Register) yang tervalidasi skema Zod secara ketat.
* **Dashboard (`presentation/screens/dashboard`)**: Menampilkan visualisasi ringkasan tugas dan saldo dana organisasi dengan interaksi data TanStack Query.
* **Tasks Module (`presentation/screens/tasks`)**: CRUD tugas organisasi dengan filter status dinamis, level prioritas, dan input assignees.
* **Members Module (`presentation/screens/members`)**: Undangan anggota baru, pengaturan level peran pengurus, dan opsi pelepasan anggota.
* **Divisions Module (`presentation/screens/divisions`)**: Pengorganisasian struktur divisi kerja kepengurusan kampus.
* **Finance Module (`presentation/screens/finance`)**: Layar input laporan buku kas keluar-masuk organisasi dengan pemuatan list transaksi super mulus berbasis FlashList.
* **Settings Module (`presentation/screens/settings`)**: Layar pengaturan profil pengguna, ubah kata sandi, serta info lisensi ruang kerja organisasi.

---

## 🚀 Panduan Setup & Menjalankan Lokal

### Prasyarat Perangkat
* **Node.js**: Versi `>= 22.11.0`.
* **Package Manager**: **Bun**.
* **Android Development**: Android Studio, Android SDK terbaru, Emulator (atau perangkat Android fisik).
* **iOS Development (Khusus macOS)**: Xcode 15+, Command Line Tools, CocoaPods, Simulator iOS.

### Langkah Memulai Pengembangan
1. **Pasang Dependensi**:
   ```bash
   bun install
   ```
2. **Pasang CocoaPods (Khusus iOS)**:
   ```bash
   cd ios && pod install && cd ..
   # Atau gunakan shortcut script:
   bun run pods
   ```
3. **Konfigurasi File Variabel Lingkungan (`.env`)**:
   Buat file `.env` di direktori `sekre-mobile/`:
   ```env
   # Ganti IP sesuai dengan alamat IP lokal mesin dev Anda jika menggunakan perangkat fisik
   API_BASE_URL=http://10.0.2.2:8080/api/v1     # Default untuk Emulator Android
   # API_BASE_URL=http://127.0.0.1:8080/api/v1   # Default untuk Simulator iOS
   ```
4. **Jalankan Metro Bundler**:
   ```bash
   bun start
   ```
5. **Jalankan Aplikasi pada Target Perangkat (Di terminal terpisah)**:
   * **Android**:
     ```bash
     bun android
     ```
   * **iOS**:
     ```bash
     bun ios
     ```

---

## 🧪 Validasi Kualitas Kode & Analisis

Sebelum melakukan integrasi kode ke git commit, pastikan seluruh perkakas validasi berjalan sukses:

```bash
# Menjalankan static typecheck TypeScript secara ketat
bunx tsc --noEmit

# Menjalankan Linter ESLint
bun run lint

# Menjalankan Unit Testing dengan Jest
bun run test

# Menjalankan Analisis Visual Ukuran Bundle JavaScript
bun run analyze-bundle
```

---

## 📦 Panduan Membuat Build Rilis Produksi

### Android (Menghasilkan APK / AAB)
1. Buka folder Android dan jalankan Gradle:
   ```bash
   cd android
   # Membuat berkas APK untuk instalasi langsung
   ./gradlew assembleRelease
   
   # Membuat berkas AAB untuk diunggah ke Google Play Store
   ./gradlew bundleRelease
   ```
2. Berkas keluaran rilis akan tersedia di:
   * **APK**: `android/app/build/outputs/apk/release/app-release.apk`
   * **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS (Menghasilkan Xcode Archive)
1. Lakukan instalasi pods rilis:
   ```bash
   cd ios && pod install && cd ..
   ```
2. Lakukan pengarsipan lewat terminal:
   ```bash
   cd ios
   xcodebuild -workspace SekreMobile.xcworkspace \
     -scheme SekreMobile \
     -configuration Release \
     -archivePath build/SekreMobile.xcarchive archive
   ```
3. Buka **Organizer** di Xcode untuk mengunggah arsip ke Apple TestFlight atau App Store Connect.
