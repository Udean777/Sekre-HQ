import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setSession, clearSession } from '@store/slices/authSlice';
import { GetMeUseCase } from '@core/usecases/auth/GetMeUseCase';
import { getAuthRepository, getTokenStorage, getTelemetry } from '@di/container';

/**
 * Bootstrap auth state on app start.
 *
 * Strategi dua-fase untuk mempercepat TTI:
 *
 * Fase 1 (sync) — cek persisted Redux state.
 *   Jika `isAuthenticated` sudah true dari redux-persist (MMKV), langsung
 *   render app tanpa menunggu network. BootSplash bisa disembunyikan lebih
 *   cepat.
 *
 * Fase 2 (background) — revalidate `/auth/me` di background.
 *   Jika token masih valid, update user/org/role di Redux tanpa blocking UI.
 *   Jika token expired/invalid, clear session dan redirect ke Login.
 *   Jika tidak ada token sama sekali, langsung ke Login (tidak ada Fase 2).
 */
export const useBootstrapAuth = (): { isBootstrapping: boolean } => {
  const dispatch = useAppDispatch();
  const isAlreadyAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  // Jika Redux persist sudah punya session, tidak perlu blocking spinner —
  // langsung false supaya BootSplash bisa hide dan app render.
  const [isBootstrapping, setIsBootstrapping] = useState(!isAlreadyAuthenticated);

  // Ref untuk mencegah double-run di StrictMode
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const bootstrap = async (): Promise<void> => {
      const token = getTokenStorage().getAccessToken();

      if (!token) {
        // Tidak ada token — pastikan state bersih, langsung ke Login
        dispatch(clearSession());
        getTelemetry().setUser(null);
        setIsBootstrapping(false);
        return;
      }

      // Kalau sudah ada persisted session, unblock UI dulu
      if (isAlreadyAuthenticated) {
        setIsBootstrapping(false);
      }

      // Revalidate di background (atau blocking kalau belum ada persisted session)
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

        getTelemetry().setUser({
          id: user.id,
          email: user.email,
          orgId: organization.id,
        });
      } catch {
        // Token expired / invalid — clear dan redirect ke Login
        getTokenStorage().clear();
        dispatch(clearSession());
        getTelemetry().setUser(null);
      } finally {
        // Pastikan spinner hilang kalau belum di-unblock di atas
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isBootstrapping };
};
