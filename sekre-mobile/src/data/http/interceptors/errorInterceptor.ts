import axios, { type AxiosInstance } from 'axios';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  NetworkError,
  ServerError,
} from '@core/domain/errors/DomainError';
import { getTelemetry } from '@di/container';

interface BackendErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}

const isBackendErrorResponse = (value: unknown): value is BackendErrorResponse =>
  typeof value === 'object' && value !== null;

/**
 * Map HTTP error response → DomainError.
 * Setiap error juga dikirim sebagai Sentry breadcrumb supaya ada trail
 * request yang gagal sebelum crash / error boundary terpicu.
 */
export const errorInterceptor = (client: AxiosInstance): void => {
  client.interceptors.response.use(
    response => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      // Network error / timeout / no response
      if (!error.response) {
        getTelemetry().addBreadcrumb({
          category: 'http',
          message: `Network error: ${error.config?.url ?? 'unknown'}`,
          level: 'error',
          data: {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
          },
        });
        return Promise.reject(new NetworkError());
      }

      const { status, data, headers } = error.response;
      const responseData = isBackendErrorResponse(data) ? data : undefined;
      const message = responseData?.message;
      const fields = responseData?.errors ?? {};

      // Breadcrumb untuk semua HTTP error — muncul di Sentry event trail
      getTelemetry().addBreadcrumb({
        category: 'http',
        message: `HTTP ${status}: ${error.config?.url ?? 'unknown'}`,
        level: status >= 500 ? 'error' : 'warning',
        data: {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status,
          responseMessage: message,
        },
      });

      switch (status) {
        case 400:
          return Promise.reject(new ValidationError(message, fields));
        case 401:
          return Promise.reject(new UnauthorizedError(message));
        case 403:
          return Promise.reject(new ForbiddenError(message));
        case 404:
          return Promise.reject(new NotFoundError(message));
        case 409:
          return Promise.reject(new ConflictError(message));
        case 429: {
          const retryAfter = headers['retry-after']
            ? Number(headers['retry-after'])
            : undefined;
          return Promise.reject(new RateLimitError(message, retryAfter));
        }
        default:
          if (status >= 500) {
            getTelemetry().captureException(new ServerError(status, message), {
              url: error.config?.url,
              method: error.config?.method?.toUpperCase(),
              status,
            });
            return Promise.reject(new ServerError(status, message));
          }
          return Promise.reject(error);
      }
    },
  );
};
