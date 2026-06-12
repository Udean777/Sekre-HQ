const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
// Pastikan URL selalu berakhiran /api/v1 (menghapus trailing slash jika ada lalu menambahkannya)
const API_BASE_URL = `${rawApiUrl.replace(/\/$/, '')}/api/v1`;

export const API_CONFIG = {
  // Ganti dengan URL backend yang sesuai (contoh: http://192.168.x.x:8080 untuk testing di device fisik)
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000, // 10 detik
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  ORGANIZATIONS: {
    BASE: '/organizations',
  },
  TASKS: {
    BASE: '/tasks',
  },
  FINANCE: {
    BASE: '/finance',
  },
};
