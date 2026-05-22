# CI/CD Plan — Sekre Project

> Dibuat: 22 Mei 2026
> Status: Draft

---

## Ringkasan

Monorepo ini terdiri dari 3 project:

| Project | Stack | Deploy Target |
|---|---|---|
| `sekre-backend` | Go | Render (Docker) |
| `sekre-frontend` | SvelteKit + Bun | Render |
| `sekre-mobile` | React Native + Bun | GitHub Release (APK + AAB) |

Setiap project memiliki workflow CI/CD **terpisah** dan hanya berjalan jika ada perubahan di direktori project-nya masing-masing menggunakan `paths` filter bawaan GitHub Actions.

---

## Struktur Workflow

```
.github/workflows/
├── backend-ci.yml     ✅ sudah ada (tidak diubah)
├── frontend-ci.yml    🆕 akan dibuat
└── mobile-ci.yml      🆕 akan dibuat
```

Pola yang dipakai: **1 file per project** — CI dan CD digabung dalam satu file, dengan job CD hanya berjalan saat push ke `main`.

---

## 1. Backend — `backend-ci.yml` ✅

> Sudah ada, tidak perlu diubah.

### Trigger

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'sekre-backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    branches: [main]
    paths:
      - 'sekre-backend/**'
      - '.github/workflows/backend-ci.yml'
```

### Jobs

```
ci                → lint (golangci-lint) + unit test + integration test + build binary
docker-build-push → build & push Docker image ke GHCR  [main only]
deploy            → trigger Render deploy hook           [main only]
```

### Secrets yang dibutuhkan

| Secret | Keterangan |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Deploy hook URL dari Render dashboard |
| `RENDER_SERVICE_URL` | URL publik service backend di Render |
| `GITHUB_TOKEN` | Auto-provided oleh GitHub, tidak perlu setup manual |

---

## 2. Frontend — `frontend-ci.yml` 🆕

### Trigger

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'sekre-frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [main]
    paths:
      - 'sekre-frontend/**'
      - '.github/workflows/frontend-ci.yml'
```

### Jobs

```
ci      → type-check + build                  [push & PR]
deploy  → trigger Render deploy hook           [main only, needs: ci]
```

### Detail Job `ci`

1. Checkout code
2. Setup Bun
3. `bun install`
4. `bun run check` — svelte-check + TypeScript validation
5. `bun run build` — Vite production build

> Tidak ada test runner di `package.json` frontend saat ini, step test di-skip.
> Bisa ditambahkan nanti jika Vitest atau testing library ditambahkan.

### Detail Job `deploy`

Pola identik dengan backend:

1. Create GitHub Deployment (muncul di commit/PR timeline)
2. Set deployment status → `in_progress`
3. Trigger Render deploy hook via `curl`
4. Set deployment status → `success` atau `failure`

### Secrets yang dibutuhkan

| Secret | Keterangan |
|---|---|
| `RENDER_DEPLOY_HOOK_URL_FRONTEND` | Deploy hook URL dari Render dashboard (service frontend) |
| `RENDER_SERVICE_URL_FRONTEND` | URL publik service frontend di Render |

---

## 3. Mobile — `mobile-ci.yml` 🆕

### Trigger

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'sekre-mobile/**'
      - '.github/workflows/mobile-ci.yml'
  pull_request:
    branches: [main]
    paths:
      - 'sekre-mobile/**'
      - '.github/workflows/mobile-ci.yml'
```

### Jobs

```
ci              → lint + type-check + test     [push & PR]
build-android   → APK + AAB release build      [main only, needs: ci]
```

### Detail Job `ci`

1. Checkout code
2. Setup Node 22 + Bun
3. `bun install`
4. `bun run lint` — ESLint
5. `bunx tsc --noEmit` — TypeScript check
6. `bun run test` — Jest

### Detail Job `build-android`

1. Checkout code
2. Setup Java 17 + Node 22 + Bun
3. `bun install`
4. Decode `ANDROID_KEYSTORE_BASE64` → tulis ke file `sekre-release.keystore`
5. Inject signing config ke `android/gradle.properties`:
   - `MYAPP_UPLOAD_STORE_FILE`
   - `MYAPP_UPLOAD_KEY_ALIAS`
   - `MYAPP_UPLOAD_STORE_PASSWORD`
   - `MYAPP_UPLOAD_KEY_PASSWORD`
6. Update `android/app/build.gradle` — signing config release pakai properties di atas (bukan `signingConfigs.debug`)
7. `./gradlew assembleRelease` → hasilkan APK
8. `./gradlew bundleRelease` → hasilkan AAB
9. Upload artifact APK + AAB ke GitHub Actions (retention 30 hari)
10. Buat GitHub Release dengan tag `mobile-v{versionName}-{sha}` + attach APK & AAB — **hanya saat push ke `main`**

### Platform

| Platform | Status | Keterangan |
|---|---|---|
| Android | ✅ Diimplementasi | APK + AAB, signed release |
| iOS | ⏭️ Skip | Belum ada Apple Developer certificate |

### Perubahan File yang Diperlukan

`android/app/build.gradle` perlu diupdate — signing config `release` saat ini masih pakai `signingConfigs.debug`:

```groovy
// Sebelum (tidak aman untuk release)
release {
    signingConfig signingConfigs.debug
}

// Sesudah
release {
    signingConfig signingConfigs.release
}
```

Dan tambah `signingConfigs.release` yang baca dari `gradle.properties`:

```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
```

### Secrets yang dibutuhkan

| Secret | Keterangan |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Keystore file di-encode base64 |
| `ANDROID_KEY_ALIAS` | Alias key yang dipakai saat generate keystore |
| `ANDROID_KEY_PASSWORD` | Password key |
| `ANDROID_STORE_PASSWORD` | Password keystore |

### Cara Generate Keystore (jalankan sekali secara lokal)

```bash
# 1. Generate keystore
keytool -genkeypair \
  -v \
  -keystore sekre-release.keystore \
  -alias sekre-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 2. Encode ke base64 (macOS — hasil langsung masuk clipboard)
base64 -i sekre-release.keystore | pbcopy

# 3. Paste hasil clipboard sebagai value secret ANDROID_KEYSTORE_BASE64 di GitHub
```

> **Penting:** Simpan file `sekre-release.keystore` di tempat aman di luar repo.
> File ini wajib ada jika ingin update app di Play Store di masa depan.
> Jangan pernah commit file ini ke repository.

---

## Cara Menambahkan Secrets di GitHub

1. Buka repository di GitHub
2. Klik tab **Settings**
3. Sidebar kiri → **Secrets and variables** → **Actions**
4. Klik **New repository secret**
5. Isi **Name** dan **Secret** sesuai tabel di masing-masing section
6. Klik **Add secret**

---

## Ringkasan Semua Secrets

| Secret | Dipakai oleh |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | `backend-ci.yml` |
| `RENDER_SERVICE_URL` | `backend-ci.yml` |
| `RENDER_DEPLOY_HOOK_URL_FRONTEND` | `frontend-ci.yml` |
| `RENDER_SERVICE_URL_FRONTEND` | `frontend-ci.yml` |
| `ANDROID_KEYSTORE_BASE64` | `mobile-ci.yml` |
| `ANDROID_KEY_ALIAS` | `mobile-ci.yml` |
| `ANDROID_KEY_PASSWORD` | `mobile-ci.yml` |
| `ANDROID_STORE_PASSWORD` | `mobile-ci.yml` |
| `GITHUB_TOKEN` | `backend-ci.yml` (auto) |

---

## Alur Lengkap saat PR ke `main`

```
Developer buat PR
        │
        ├─ ada perubahan di sekre-backend/  → backend-ci.yml jalan (ci only)
        ├─ ada perubahan di sekre-frontend/ → frontend-ci.yml jalan (ci only)
        └─ ada perubahan di sekre-mobile/   → mobile-ci.yml jalan (ci only)

PR di-merge ke main
        │
        ├─ ada perubahan di sekre-backend/  → backend-ci.yml jalan (ci + docker-build-push + deploy)
        ├─ ada perubahan di sekre-frontend/ → frontend-ci.yml jalan (ci + deploy)
        └─ ada perubahan di sekre-mobile/   → mobile-ci.yml jalan (ci + build-android + github release)
```

---

## Status Implementasi

| File | Status |
|---|---|
| `.github/workflows/backend-ci.yml` | ✅ Sudah ada |
| `.github/workflows/frontend-ci.yml` | 🔲 Belum dibuat |
| `.github/workflows/mobile-ci.yml` | 🔲 Belum dibuat |
| `sekre-mobile/android/app/build.gradle` | 🔲 Perlu diupdate (signing config) |
