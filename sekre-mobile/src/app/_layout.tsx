import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider, Slot, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useAuthStore } from '@/core/store/use-auth-store';
import { useThemeStore } from '@/core/store/use-theme-store';

const queryClient = new QueryClient();

function AuthGuard() {
  const { isAuthenticated, isLoading, setLoading, login } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check token on mount
    const checkToken = async () => {
      try {
        const { SecureStorage } = require('@/core/storage/secure-storage');
        const token = await SecureStorage.get('access_token');
        if (token) {
          const { authRepository } = require('@/data/repositories/auth.repository.impl');
          const result = await authRepository.getProfile();
          login(result.user, result.organization, result.role); 
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (
      // If the user is not authenticated and the initial segment is not '(auth)'
      !isAuthenticated &&
      !inAuthGroup
    ) {
      // Redirect to the login page.
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the login page.
      router.replace('/(app)');
    }
  }, [isAuthenticated, segments, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Sync theme store with NativeWind
    if (theme !== colorScheme) {
      setColorScheme(theme);
    }
  }, [theme]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AuthGuard />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
