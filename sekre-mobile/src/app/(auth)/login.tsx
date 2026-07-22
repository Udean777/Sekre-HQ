import React from "react";
import {
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { useLogin } from "@/features/auth/use-login";
import { useAlert } from "@/shared/context/alert-context";
import { loginSchema, type LoginForm } from "@/features/auth/auth.schema";

export default function LoginScreen() {
  const loginMutation = useLogin();

  const { alert } = useAlert();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onError: (err: any) => {
        alert(
          "Login Gagal",
          err?.response?.data?.message || "Terjadi kesalahan",
        );
      },
    });
  };

  return (
    <ThemedSafeAreaView>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Masuk
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Selamat datang kembali di Sekre
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="admin@sekre.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              title="Masuk"
              onPress={handleSubmit(onSubmit)}
              isLoading={loginMutation.isPending}
              style={styles.button}
            />
          </View>

          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Belum punya akun organisasi?{" "}
            </ThemedText>
            <Link href="/(auth)/register" asChild>
              <ThemedText type="linkPrimary" style={styles.link}>
                Daftar di sini
              </ThemedText>
            </Link>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  form: {
    gap: 4, // modern compact spacing (if supported, else margin works)
  },
  button: {
    marginTop: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: "transparent",
  },
  footerText: {
    opacity: 0.8,
  },
  link: {
    fontWeight: "bold",
  },
});
