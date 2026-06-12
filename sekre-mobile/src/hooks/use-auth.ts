import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authRepository } from '@/data/repositories/auth.repository.impl';
import { LoginRequest, RegisterRequest } from '@/data/models/auth.dto';
import { useAuthStore } from '@/core/store/use-auth-store';

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: LoginRequest) => authRepository.login(req),
    onSuccess: (result) => {
      login(result.user, result.organization, result.role);
      queryClient.setQueryData(authKeys.profile(), result.user);
    },
  });
};

export const useRegister = () => {
  const login = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegisterRequest) => authRepository.register(req),
    onSuccess: (result) => {
      // Sama seperti login, setelah register kita langsung set sebagai user terotentikasi
      login(result.user, result.organization, result.role);
      queryClient.setQueryData(authKeys.profile(), result.user);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear(); // Bersihkan semua cache react query saat logout
    },
  });
};

export const useProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authRepository.getProfile(),
    enabled: isAuthenticated, // Hanya panggil jika sudah terotentikasi
  });
};
