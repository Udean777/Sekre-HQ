import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '@store/slices/uiSlice';
import {
  isDomainError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  NetworkError,
} from '@core/domain/errors/DomainError';

/**
 * useErrorHandler — konversi domain error ke toast yang user-friendly.
 *
 * Pakai ini di mutation onError callbacks supaya error handling konsisten
 * di seluruh app tanpa duplikasi logic.
 *
 * @example
 * const handleError = useErrorHandler();
 * useMutation({ onError: handleError });
 */
export const useErrorHandler = (): ((error: unknown) => void) => {
  const dispatch = useDispatch();

  return useCallback(
    (error: unknown): void => {
      if (!isDomainError(error)) {
        dispatch(
          showToast({
            type: 'error',
            message: 'Terjadi kesalahan. Silakan coba lagi.',
          }),
        );
        return;
      }

      if (error instanceof UnauthorizedError) {
        // UnauthorizedError ditangani oleh refreshInterceptor + DeviceEventEmitter
        // Tidak perlu toast di sini — user akan di-redirect ke Login
        return;
      }

      if (error instanceof ForbiddenError) {
        dispatch(
          showToast({
            type: 'error',
            message: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
          }),
        );
        return;
      }

      if (error instanceof NotFoundError) {
        dispatch(
          showToast({
            type: 'error',
            message: 'Data tidak ditemukan.',
          }),
        );
        return;
      }

      if (error instanceof ValidationError) {
        dispatch(
          showToast({
            type: 'warning',
            message: error.message,
          }),
        );
        return;
      }

      if (error instanceof ConflictError) {
        dispatch(
          showToast({
            type: 'warning',
            message: error.message,
          }),
        );
        return;
      }

      if (error instanceof RateLimitError) {
        dispatch(
          showToast({
            type: 'warning',
            message: `Terlalu banyak permintaan. Coba lagi dalam ${error.retryAfter ?? 'beberapa'} detik.`,
          }),
        );
        return;
      }

      if (error instanceof NetworkError) {
        dispatch(
          showToast({
            type: 'error',
            message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
          }),
        );
        return;
      }

      // Fallback untuk DomainError lain
      dispatch(
        showToast({
          type: 'error',
          message: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        }),
      );
    },
    [dispatch],
  );
};
