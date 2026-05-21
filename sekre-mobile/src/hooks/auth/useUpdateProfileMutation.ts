import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from '@store/hooks';
import { updateUser } from '@store/slices/authSlice';
import { UpdateProfileUseCase } from '@core/usecases/auth/UpdateProfileUseCase';
import { getAuthRepository } from '@di/container';
import type { User } from '@core/domain/entities/User';
import type { UpdateProfileParams } from '@core/usecases/auth/UpdateProfileUseCase';

export const useUpdateProfileMutation = () => {
  const dispatch = useAppDispatch();

  return useMutation<User, Error, UpdateProfileParams>({
    mutationFn: params => {
      const useCase = new UpdateProfileUseCase(getAuthRepository());
      return useCase.execute(params);
    },
    onSuccess: user => {
      dispatch(
        updateUser({
          email: user.email,
          fullName: user.fullName,
          mustResetPassword: user.mustResetPassword,
        }),
      );
    },
  });
};
