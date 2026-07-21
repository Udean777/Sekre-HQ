import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/api-client';
import { useAuthStore } from '../../shared/store/auth-store';

export function useLogout() {
  const logoutAction = useAuthStore(state => state.logout);

  return useMutation({
    mutationFn: async () => {
      // Menembak endpoint logout ke backend agar token di-invalidate di sisi server
      await apiClient.post('/auth/logout');
    },
    onSuccess: async () => {
      // Sukses logout dari backend, kita bersihkan state lokal
      await logoutAction();
    },
    onError: async () => {
      // Meskipun gagal (misal tidak ada sinyal), kita tetap hapus data lokal agar user tidak stuck
      await logoutAction();
    }
  });
}
