import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useAppDispatch } from '@store/hooks';
import { setSession } from '@store/slices/authSlice';
import { RegisterUseCase } from '@core/usecases/auth/RegisterUseCase';
import { getAuthRepository, getTokenStorage } from '@di/container';
import type { AuthSession } from '@core/ports/IAuthRepository';

interface RegisterParams {
  orgName: string;
  subdomain: string;
  fullName: string;
  email: string;
  password: string;
}

export const useRegisterMutation = (): UseMutationResult<AuthSession, Error, RegisterParams> => {
  const dispatch = useAppDispatch();

  return useMutation<AuthSession, Error, RegisterParams>({
    mutationFn: params => {
      const useCase = new RegisterUseCase(getAuthRepository(), getTokenStorage());
      return useCase.execute(params);
    },
    onSuccess: session => {
      dispatch(
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.fullName,
            mustResetPassword: session.user.mustResetPassword,
          },
          organization: {
            id: session.organization.id,
            name: session.organization.name,
            subdomain: session.organization.subdomain,
            subscriptionPlan: session.organization.subscriptionPlan,
          },
          role: session.role,
        }),
      );
    },
  });
};
