import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import { SecureStorage } from '../storage/secure-storage';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStorage.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 dan bukan saat mencoba memanggil refresh token (untuk mencegah loop)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== ENDPOINTS.AUTH.REFRESH) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStorage.get('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Panggil endpoint refresh token
        const response = await axios.post(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: new_refresh_token } = response.data.data;

        // Simpan token baru
        await SecureStorage.save('access_token', access_token);
        if (new_refresh_token) {
          await SecureStorage.save('refresh_token', new_refresh_token);
        }

        // Ubah header originalRequest dengan token baru
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Jalankan ulang request yang sebelumnya gagal
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Jika refresh token gagal (misal expired), hapus token agar user ter-logout
        await SecureStorage.remove('access_token');
        await SecureStorage.remove('refresh_token');
        
        // Panggil global store untuk mengubah state isAuthenticated menjadi false
        const { useAuthStore } = require('../store/use-auth-store');
        useAuthStore.getState().logout();
        
        // PENTING: Untuk Expo Router, redirect ke login bisa dihandle di store atau level UI,
        // di sini kita hanya melempar error agar ditangkap oleh React Query
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
