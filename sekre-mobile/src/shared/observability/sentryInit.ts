import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import { navigationIntegration } from '@app/navigation/RootNavigator';

/**
 * initSentry — panggil SEKALI sebelum AppRegistry.registerComponent.
 *
 * - DSN dibaca dari react-native-config (SENTRY_DSN di .env)
 * - Kalau DSN kosong (dev tanpa .env), Sentry tidak diinit — app tetap jalan
 * - tracesSampleRate: 0.2 di prod, 1.0 di dev
 * - profilesSampleRate: 0.1 di prod (Sentry profiling, butuh Hermes)
 * - enableNativeFramesTracking: ukur slow/frozen frames di native layer
 * - attachScreenshot: kirim screenshot saat crash (prod only)
 */
export const initSentry = (): void => {
  const dsn = Config.SENTRY_DSN;

  if (!dsn) {
    if (__DEV__) {
      console.warn('[Sentry] SENTRY_DSN tidak ditemukan di .env — Sentry dinonaktifkan.');
    }
    return;
  }

  const isProd = Config.APP_ENV === 'production';

  Sentry.init({
    dsn,

    // ── React Navigation instrumentation ────────────────────────────────
    // Instance yang sama dipakai di RootNavigator.onReady
    integrations: [navigationIntegration],

    // ── Performance tracing ──────────────────────────────────────────────
    tracesSampleRate: isProd ? 0.2 : 1.0,

    // ── Profiling (Hermes only) ──────────────────────────────────────────
    // profilesSampleRate adalah rasio dari transaksi yang sudah di-trace
    profilesSampleRate: isProd ? 0.1 : 1.0,

    // ── Native frames tracking ───────────────────────────────────────────
    // Deteksi slow frames (>16ms) dan frozen frames (>700ms) di native layer
    enableNativeFramesTracking: true,

    // ── Screenshot on crash ──────────────────────────────────────────────
    attachScreenshot: isProd,

    // ── Environment tagging ──────────────────────────────────────────────
    environment: Config.APP_ENV ?? 'development',

    // ── Debug logging (dev only) ─────────────────────────────────────────
    debug: __DEV__,

    // ── Breadcrumb config ────────────────────────────────────────────────
    maxBreadcrumbs: 50,

    // ── Ignore noise ─────────────────────────────────────────────────────
    ignoreErrors: [
      // Network errors yang bukan bug app
      'Network request failed',
      'NetworkError',
      // React Navigation internal
      'The action was not handled by any navigator',
    ],
  });
};
