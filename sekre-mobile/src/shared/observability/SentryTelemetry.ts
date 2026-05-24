import * as Sentry from '@sentry/react-native';
import type { ITelemetry, ITransaction, TelemetryUser, TraceOp } from './ITelemetry';

class SentryTransaction implements ITransaction {
  private readonly _span: Sentry.Span;

  constructor(span: Sentry.Span) {
    this._span = span;
  }

  finish(): void {
    this._span.end();
  }
}

/**
 * SentryTelemetry — implementasi ITelemetry menggunakan @sentry/react-native.
 *
 * Tidak di-export langsung ke consumer — semua akses lewat DI container
 * (`getTelemetry()`) supaya mudah di-mock saat testing.
 */
export class SentryTelemetry implements ITelemetry {
  captureException(error: unknown, ctx?: Record<string, unknown>): void {
    Sentry.withScope(scope => {
      if (ctx) {
        scope.setExtras(ctx);
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    Sentry.captureMessage(message, level);
  }

  setUser(user: TelemetryUser | null): void {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        // custom tag — muncul di Sentry filter
        data: { orgId: user.orgId },
      });
    } else {
      Sentry.setUser(null);
    }
  }

  addBreadcrumb(options: {
    category: string;
    message: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }): void {
    Sentry.addBreadcrumb({
      category: options.category,
      message: options.message,
      level: options.level ?? 'info',
      data: options.data,
    });
  }

  startTransaction(name: string, op: TraceOp): ITransaction {
    const span = Sentry.startInactiveSpan({ name, op });
    return new SentryTransaction(span);
  }
}
