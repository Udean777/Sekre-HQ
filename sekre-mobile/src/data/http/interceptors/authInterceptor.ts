import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';

/**
 * Inject Authorization: Bearer <access_token> ke setiap request
 */
export const authInterceptor = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    },
    error => Promise.reject(error),
  );
};
