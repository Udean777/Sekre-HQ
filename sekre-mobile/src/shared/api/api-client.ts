import axios from "axios";
import { ENV } from "@/shared/config/env";
import { storage } from "@/shared/lib/storage";
import { useAuthStore } from "@/shared/store/auth-store";

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    if (__DEV__) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      );
    }

    // Inject Token
    const token = await storage.getToken("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getToken("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Refresh token call
        const response = await axios.post(`${ENV.API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newTokens = response.data.data; // Assuming your backend wraps response in data: { access_token... }

        await storage.setToken("access_token", newTokens.access_token);
        await storage.setToken("refresh_token", newTokens.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, we should logout the user (clear store & storage)
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    if (__DEV__) {
      console.error(`[API Error]`, error?.response?.data || error.message);
    }
    return Promise.reject(error);
  },
);
