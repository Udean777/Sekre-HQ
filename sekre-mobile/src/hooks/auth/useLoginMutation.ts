import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useAppDispatch } from '@store/hooks';
import { setSession } from '@store/slices/authSlice';
import { LoginUseCase } from '@core/usecases/auth/LoginUseCase';
import { getAuthRepository, getTokenStorage, getTelemetry } from '@di/container';
import type { AuthSession } from '@core/ports/IAuthRepository';

export const useLoginMutation = (): UseMutationResult<
  AuthSession,
  Error,
  { email: string; password: string }
> => {
  const dispatch = useAppDispatch();

  return useMutation<AuthSession, Error, { email: string; password: string }>({
    mutationFn: ({ email, password }) => {
      const useCase = new LoginUseCase(getAuthRepository(), getTokenStorage());
      return useCase.execute(email, password);
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

      // Set Sentry user context — muncul di setiap event setelah login
      getTelemetry().setUser({
        id: session.user.id,
        email: session.user.email,
        orgId: session.organization.id,
      });
    },
  });
};
