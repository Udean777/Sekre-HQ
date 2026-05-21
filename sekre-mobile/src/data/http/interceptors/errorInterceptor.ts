import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
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

interface BackendErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Map HTTP error response → DomainError
 */
export const errorInterceptor = (client: AxiosInstance): void => {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      // Network error / timeout / no response
      if (!error.response) {
        return Promise.reject(new NetworkError());
      }

      const { status, data } =
        error.response as AxiosResponse<BackendErrorResponse>;
      const message = data?.message;
      const fields = data?.errors ?? {};

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
          const retryAfter = error.response.headers['retry-after']
            ? Number(error.response.headers['retry-after'])
            : undefined;
          return Promise.reject(new RateLimitError(message, retryAfter));
        }
        default:
          if (status >= 500) {
            return Promise.reject(new ServerError(status, message));
          }
          return Promise.reject(error);
      }
    },
  );
};
