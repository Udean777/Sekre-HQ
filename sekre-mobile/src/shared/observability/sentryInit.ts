import * as Sentry from '@sentry/react-native';
import type { ErrorEvent, Breadcrumb } from '@sentry/react-native';
import type { EventHint } from '@sentry/core';
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
 * - beforeSend: strip PII sebelum event dikirim ke Sentry
 * - beforeBreadcrumb: sanitize Authorization header dari HTTP breadcrumbs
 */

// ─── Sensitive field names — di-redact dari request/response body ─────────────

const SENSITIVE_FIELDS = new Set([
  'password',
  'password_confirmation',
  'current_password',
  'new_password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'secret',
  'api_key',
  'otp',
  'pin',
]);

/**
 * Redact sensitive fields dari object secara rekursif.
 * Mengganti value dengan '[Filtered]' tanpa menghapus key
 * supaya struktur data tetap terlihat di Sentry.
 */
const redactSensitiveFields = (obj: unknown, depth = 0): unknown => {
  // Batasi depth untuk mencegah infinite recursion pada circular ref
  if (depth > 5 || obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveFields(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      result[key] = '[Filtered]';
    } else {
      result[key] = redactSensitiveFields(value, depth + 1);
    }
  }
  return result;
};

/**
 * beforeSend — strip PII dari Sentry event sebelum dikirim ke server.
 *
 * Yang di-strip:
 * - request.data (body) — bisa mengandung password/token
 * - request.headers.Authorization — Bearer token
 * - user.email di prod (privacy)
 * - extra fields yang sensitif
 */
const beforeSend = (event: ErrorEvent, _hint: EventHint): ErrorEvent | null => {
  // Strip Authorization header dari request
  if (event.request?.headers) {
    const headers = { ...event.request.headers };
    if (typeof headers.Authorization === 'string') headers.Authorization = '[Filtered]';
    if (typeof headers.authorization === 'string') headers.authorization = '[Filtered]';
    event.request.headers = headers;
  }

  // Redact sensitive fields dari request body
  if (event.request?.data) {
    event.request.data = redactSensitiveFields(event.request.data);
  }

  // Strip email dari user context di production (GDPR/privacy)
  const isProd = Config.APP_ENV === 'production';
  if (isProd && event.user?.email) {
    event.user = { ...event.user, email: '[Filtered]' };
  }

  return event;
};

/**
 * beforeBreadcrumb — sanitize HTTP breadcrumbs.
 *
 * Yang di-strip:
 * - Authorization header dari breadcrumb data
 * - Request body yang mengandung password/token
 * - Breadcrumb dari endpoint auth (bisa mengandung credentials)
 */
const beforeBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb | null => {
  if (breadcrumb.category === 'http' && breadcrumb.data) {
    const data = { ...breadcrumb.data };

    // Strip Authorization header
    if (typeof data.Authorization === 'string') {
      data.Authorization = '[Filtered]';
    }
    if (typeof data.authorization === 'string') {
      data.authorization = '[Filtered]';
    }

    // Redact body jika ada
    if (data.body) {
      data.body = redactSensitiveFields(data.body);
    }

    breadcrumb.data = data;
  }

  // Drop breadcrumb dari endpoint auth — bisa mengandung credentials di URL params
  if (
    breadcrumb.category === 'http' &&
    typeof breadcrumb.data?.url === 'string' &&
    breadcrumb.data.url.includes('/auth/')
  ) {
    return {
      ...breadcrumb,
      data: {
        ...breadcrumb.data,
        url: '[auth endpoint]',
      },
    };
  }

  return breadcrumb;
};

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
    integrations: [navigationIntegration],

    // ── Performance tracing ──────────────────────────────────────────────
    tracesSampleRate: isProd ? 0.2 : 1.0,

    // ── Profiling (Hermes only) ──────────────────────────────────────────
    profilesSampleRate: isProd ? 0.1 : 1.0,

    // ── Native frames tracking ───────────────────────────────────────────
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
      'Network request failed',
      'NetworkError',
      'The action was not handled by any navigator',
    ],

    // ── PII / security filters ───────────────────────────────────────────
    beforeSend,
    beforeBreadcrumb,
  });
};
