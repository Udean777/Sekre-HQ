import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedText } from "@/shared/ui/themed-text";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { BellSlash } from "phosphor-react-native";
import { Stack } from "expo-router";

export default function NotificationsScreen() {
  const theme = useTheme();
  return (
    <ThemedSafeAreaView style={styles.wrapper}>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedHeader title="Notifikasi" showBackButton withSafeArea={false} />
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSelected }]}>
          <BellSlash color={theme.textSecondary} size={32} weight="fill" />
        </View>
        <ThemedText style={styles.title}>Belum ada notifikasi</ThemedText>
        <ThemedText style={styles.subtitle}>
          Notifikasi terbaru mengenai aktivitas Anda akan muncul di sini.
        </ThemedText>
      </View>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
  },
});
