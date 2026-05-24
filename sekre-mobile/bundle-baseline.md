# Bundle Baseline — PR 5 (Phase 6)

Generated: 2026-05-24
Platform: Android (unminified dev bundle for module attribution)

## Bundle Size

| Variant | Size |
|---|---|
| Android dev (unminified) | 14.26 MB |
| Android prod (minified JS) | 6.26 MB |
| Android prod (Hermes bytecode, est.) | ~3.8–4.4 MB |

> Hermes bytecode estimate: minified JS × 0.6–0.7 (typical Hermes compression ratio).
> Actual size confirmed saat `./gradlew bundleRelease`.

## Module Count

| Category | Count |
|---|---|
| Total source files | 3,246 |
| App source files (`src/`) | 202 |
| node_modules files | 3,043 |

## Top 20 Packages by Module Count

| Rank | Modules | Package | Notes |
|---|---|---|---|
| 1 | 826 | `date-fns` | ⚠️ Tree-shaking candidate — import spesifik bukan `import * from 'date-fns'` |
| 2 | 440 | `react-native` | Core — tidak bisa dikurangi |
| 3 | 424 | `@sentry/core` | Monitoring — expected |
| 4 | 283 | `react-native-reanimated` | Animation — expected |
| 5 | 148 | `zod` | Validation — expected |
| 6 | 121 | `@sentry/react-native` | Monitoring — expected |
| 7 | 82 | `react-native-gesture-handler` | Gesture — expected |
| 8 | 74 | `@react-navigation/core` | Navigation — expected |
| 9 | 52 | `@shopify/flash-list` | List — expected |
| 10 | 49 | `react-native-screens` | Navigation — expected |
| 11 | 48 | `@sentry/browser` | Monitoring — expected |
| 12 | 47 | `@tanstack/react-query` | Data fetching — expected |
| 13 | 39 | `@sentry-internal/browser-utils` | Monitoring — expected |
| 14 | 39 | `react-native-worklets` | Reanimated dep — expected |
| 15 | 37 | `@react-navigation/elements` | Navigation — expected |
| 16 | 35 | `@babel/runtime` | Runtime helpers — expected |
| 17 | 24 | `@react-navigation/native` | Navigation — expected |
| 18 | 24 | `@tanstack/query-core` | Data fetching — expected |
| 19 | 22 | `react-i18next` | i18n — expected |
| 20 | 18 | `@sentry/react` | Monitoring — expected |

## Optimization Opportunities

### High Priority
- **`date-fns` (826 modules, #1)** — Terbesar di bundle. Audit import pattern:
  - Bad: `import { format } from 'date-fns'` sudah tree-shakeable di date-fns v3
  - Verify: semua import sudah named import, bukan `import * as dateFns`
  - Potential saving: 200–400 modules kalau ada barrel import yang tidak tree-shake

### Low Priority (future PRs)
- `@sentry/core` + `@sentry/react-native` + `@sentry/browser` + `@sentry-internal/browser-utils` = 632 modules total
  - Sentry v8 sudah modular — tidak banyak yang bisa dikurangi tanpa ganti SDK
- `zod` (148 modules) — sudah tree-shakeable, tidak ada optimasi signifikan

## Budget Enforcement (Phase 7)

Target untuk PR 6 (Phase 7 CI budget):
- Android prod JS bundle: **≤ 6.5 MB** (current: 6.26 MB, headroom: ~240 KB)
- Module count: **≤ 3,300** (current: 3,246, headroom: ~54 modules)

Jika `date-fns` import diaudit dan ada barrel import yang diperbaiki,
target bisa diperketat ke **≤ 6.0 MB**.
