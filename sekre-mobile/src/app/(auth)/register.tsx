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
import * as z from "zod";
import { Link } from "expo-router";

import { Input } from "../../shared/ui/input";
import { Button } from "../../shared/ui/button";
import { ThemedView } from "../../shared/ui/themed-view";
import { ThemedText } from "../../shared/ui/themed-text";
import { ThemedSafeAreaView } from "../../shared/ui/themed-safe-area";
import { ThemedScrollView } from "../../shared/ui/themed-scroll-view";
import { useRegister } from "../../features/auth/use-register";

const registerSchema = z.object({
  organization_name: z.string().min(2, "Minimal 2 karakter"),
  subdomain: z.string().min(2, "Minimal 2 karakter"),
  full_name: z.string().min(2, "Minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Minimal 8 karakter"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data, {
      onError: (err: any) => {
        Alert.alert(
          "Registrasi Gagal",
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
        <ThemedScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Daftar
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Buat organisasi baru di Sekre
            </ThemedText>
          </View>

          <View style={styles.form}>
            {/* Row 1: Org Name & Subdomain */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Controller
                  control={control}
                  name="organization_name"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Nama Organisasi"
                      placeholder="BEM..."
                      value={value}
                      onChangeText={onChange}
                      error={errors.organization_name?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.flex1}>
                <Controller
                  control={control}
                  name="subdomain"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Subdomain (URL)"
                      placeholder="bem-url"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      error={errors.subdomain?.message}
                    />
                  )}
                />
              </View>
            </View>

            {/* Row 2: Full Name */}
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nama Anda (Owner)"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  error={errors.full_name?.message}
                />
              )}
            />

            {/* Row 3: Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Pribadi"
                  placeholder="owner@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            {/* Row 4: Password */}
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
              title="Daftar Organisasi"
              onPress={handleSubmit(onSubmit)}
              isLoading={registerMutation.isPending}
              style={styles.button}
            />
          </View>

          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Sudah punya akun?{" "}
            </ThemedText>
            <Link href="/(auth)/login" asChild>
              <ThemedText type="linkPrimary" style={styles.link}>
                Masuk di sini
              </ThemedText>
            </Link>
          </ThemedView>
        </ThemedScrollView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
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
    gap: 0,
  },
  row: {
    flexDirection: "row",
    gap: 12, // Requires modern React Native / Expo
  },
  flex1: {
    flex: 1,
  },
  button: {
    marginTop: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
    backgroundColor: "transparent",
  },
  footerText: {
    opacity: 0.8,
  },
  link: {
    fontWeight: "bold",
  },
});
