import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { ChangePasswordUseCase } from '@core/usecases/auth/ChangePasswordUseCase';
import { getAuthRepository } from '@di/container';
import type { ChangePasswordParams } from '@core/usecases/auth/ChangePasswordUseCase';

export const useChangePasswordMutation = (): UseMutationResult<
  void,
  Error,
  ChangePasswordParams
> => {
  return useMutation<void, Error, ChangePasswordParams>({
    mutationFn: params => {
      const useCase = new ChangePasswordUseCase(getAuthRepository());
      return useCase.execute(params);
    },
  });
};
