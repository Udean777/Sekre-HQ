import { useMutation } from '@tanstack/react-query';
import { ChangePasswordUseCase } from '@core/usecases/auth/ChangePasswordUseCase';
import { getAuthRepository } from '@di/container';
import type { ChangePasswordParams } from '@core/usecases/auth/ChangePasswordUseCase';

export const useChangePasswordMutation = () => {
  return useMutation<void, Error, ChangePasswordParams>({
    mutationFn: params => {
      const useCase = new ChangePasswordUseCase(getAuthRepository());
      return useCase.execute(params);
    },
  });
};
