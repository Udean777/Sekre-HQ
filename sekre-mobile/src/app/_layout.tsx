import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";
import { useAuthStore } from "@/shared/store/auth-store";
import { storage } from "@/shared/lib/storage";
import { apiClient } from "@/shared/api/api-client";
import { ThemedView } from "@/shared/ui/themed-view";
import { useTheme } from "@/shared/lib/hooks/use-theme";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertProvider } from "@/shared/context/alert-context";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, setAuthRestored, logout } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await storage.getToken("access_token");
        if (!token) {
          setIsReady(true);
          return;
        }

        if (!isAuthenticated) {
          // Kita punya token, mari cek keasliannya ke backend sekalian ambil data user
          const response = await apiClient.get("/auth/me");
          const data = response.data.data;

          setAuthRestored({
            user: data.user,
            organization: data.organization,
            role: data.role,
          });
        }
      } catch (error) {
        console.error(
          "Gagal mengambil data user saat startup, token mungkin kadaluwarsa:",
          error,
        );
        // Token tidak valid atau sesi habis, bersihkan state
        await logout();
      } finally {
        setIsReady(true);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isReady]);

  if (!isReady) {
    // Splash/Loading Screen yang anggun sambil ngecek token
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AlertProvider>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}
