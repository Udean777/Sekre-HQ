/**
 * ITelemetry — port untuk crash reporting & performance monitoring.
 *
 * Semua kode di luar layer `shared/observability` hanya boleh bicara
 * ke interface ini. Implementasi konkret (Sentry, Crashlytics, dll)
 * di-inject via DI container — DIP compliant.
 */

export interface ITransaction {
  finish(): void;
}

export type TelemetryUser = Readonly<{
  id: string;
  email?: string;
  orgId?: string;
}>;

export type TraceOp = 'navigation' | 'http.client' | 'ui.render' | 'db.query' | 'function';

export interface ITelemetry {
  /**
   * Kirim exception ke crash reporting.
   * `ctx` adalah extra data yang akan muncul di Sentry "Additional Data".
   */
  captureException(error: unknown, ctx?: Record<string, unknown>): void;

  /**
   * Kirim pesan non-fatal (info / warning).
   */
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;

  /**
   * Set user context — muncul di setiap event Sentry setelah dipanggil.
   * Panggil `setUser(null)` saat logout.
   */
  setUser(user: TelemetryUser | null): void;

  /**
   * Tambah breadcrumb manual (misal: aksi user, state change).
   */
  addBreadcrumb(options: {
    category: string;
    message: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }): void;

  /**
   * Mulai performance transaction. Panggil `.finish()` saat selesai.
   */
  startTransaction(name: string, op: TraceOp): ITransaction;
}
