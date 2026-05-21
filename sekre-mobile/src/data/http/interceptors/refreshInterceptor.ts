import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';
import { ENDPOINTS } from '../endpoints';

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

// Extend config untuk flag retry
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null): void => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  pendingQueue = [];
};

/**
 * Handle 401 — single-flight refresh token, queue concurrent requests
 * Jika refresh gagal → clear storage → emit event untuk navigasi ke Login
 */
export const refreshInterceptor = (client: AxiosInstance): void => {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as RetryConfig | undefined;

      // Hanya handle 401, skip jika sudah retry atau request ke /auth/refresh itu sendiri
      if (
        error.response?.status !== 401 ||
        originalRequest?._retry ||
        originalRequest?.url === ENDPOINTS.AUTH.REFRESH
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Antri request yang concurrent
        return new Promise<AxiosResponse>((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              if (originalRequest) {
                originalRequest.headers.set('Authorization', `Bearer ${token}`);
                resolve(client(originalRequest));
              }
            },
            reject,
          });
        });
      }

      if (!originalRequest) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await client.post<RefreshResponse>(
          ENDPOINTS.AUTH.REFRESH,
          {
            refresh_token: refreshToken,
          },
        );

        tokenStorage.setAccessToken(data.access_token);
        tokenStorage.setRefreshToken(data.refresh_token);

        processQueue(null, data.access_token);

        originalRequest.headers.set(
          'Authorization',
          `Bearer ${data.access_token}`,
        );
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();

        // Emit event — RootNavigator akan listen dan redirect ke Login
        const { DeviceEventEmitter } = require('react-native');
        DeviceEventEmitter.emit('auth:logout');

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};
