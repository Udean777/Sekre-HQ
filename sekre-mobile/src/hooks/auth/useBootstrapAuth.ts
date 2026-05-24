import { useEffect, useState } from 'react';
import { useAppDispatch } from '@store/hooks';
import { setSession, clearSession } from '@store/slices/authSlice';
import { GetMeUseCase } from '@core/usecases/auth/GetMeUseCase';
import { getAuthRepository, getTokenStorage, getTelemetry } from '@di/container';

/**
 * Bootstrap auth state on app start.
 * - Jika access token ada di storage → call /auth/me → populate Redux
 * - Jika gagal (token expired/invalid) → clear session → redirect ke Login
 * - Set Sentry user context setelah berhasil bootstrap
 */
export const useBootstrapAuth = (): { isBootstrapping: boolean } => {
  const dispatch = useAppDispatch();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      const token = getTokenStorage().getAccessToken();

      if (!token) {
        dispatch(clearSession());
        setIsBootstrapping(false);
        return;
      }

      try {
        const useCase = new GetMeUseCase(getAuthRepository());
        const { user, organization, role } = await useCase.execute();

        dispatch(
          setSession({
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              mustResetPassword: user.mustResetPassword,
            },
            organization: {
              id: organization.id,
              name: organization.name,
              subdomain: organization.subdomain,
              subscriptionPlan: organization.subscriptionPlan,
            },
            role,
          }),
        );

        // Set Sentry user context setelah bootstrap berhasil
        getTelemetry().setUser({
          id: user.id,
          email: user.email,
          orgId: organization.id,
        });
      } catch {
        getTokenStorage().clear();
        dispatch(clearSession());
        // Clear Sentry user context kalau bootstrap gagal
        getTelemetry().setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [dispatch]);

  return { isBootstrapping };
};
