/**
 * NoopTelemetry — implementasi ITelemetry yang tidak melakukan apa-apa.
 *
 * Dipakai sebagai fallback saat SENTRY_DSN tidak tersedia (misal: dev
 * environment tanpa .env, atau unit test). Mencegah crash akibat
 * Sentry.init tidak dipanggil.
 */
import type { ITelemetry, ITransaction, TelemetryUser, TraceOp } from './ITelemetry';

const noopTransaction: ITransaction = {
  finish: () => undefined,
};

export class NoopTelemetry implements ITelemetry {
  captureException(_error: unknown, _ctx?: Record<string, unknown>): void {
    // noop
  }

  captureMessage(_message: string, _level?: 'info' | 'warning' | 'error'): void {
    // noop
  }

  setUser(_user: TelemetryUser | null): void {
    // noop
  }

  addBreadcrumb(_options: {
    category: string;
    message: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }): void {
    // noop
  }

  startTransaction(_name: string, _op: TraceOp): ITransaction {
    return noopTransaction;
  }
}
