import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useAppDispatch } from '@store/hooks';
import { clearSession } from '@store/slices/authSlice';
import { LogoutUseCase } from '@core/usecases/auth/LogoutUseCase';
import { getAuthRepository, getTokenStorage, getTelemetry } from '@di/container';

export const useLogoutMutation = (): UseMutationResult<void, Error, void> => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => {
      const useCase = new LogoutUseCase(getAuthRepository(), getTokenStorage());
      return useCase.execute();
    },
    onSettled: () => {
      // Clear semua cached queries saat logout
      queryClient.clear();
      dispatch(clearSession());

      // Clear Sentry user context supaya event setelah logout tidak ter-tag ke user lama
      getTelemetry().setUser(null);
    },
  });
};
