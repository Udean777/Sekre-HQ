import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { useResetPassword } from "@/features/auth/use-reset-password";
import { useAlert } from "@/shared/context/alert-context";
import {
  resetPasswordSchema,
  type ResetPasswordForm,
} from "@/features/auth/auth.schema";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { ArrowLeft } from "phosphor-react-native";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useTranslation } from "react-i18next";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token: tokenParam } = useLocalSearchParams<{ token: string }>();
  const theme = useTheme();
  const { t } = useTranslation();
  const resetMutation = useResetPassword();
  const { alert } = useAlert();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenParam || "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    resetMutation.mutate(
      { token: data.token, new_password: data.new_password },
      {
        onSuccess: () => {
          alert(t("auth.passwordResetSuccess"));
          router.replace("/(auth)/login" as any);
        },
        onError: (err: any) => {
          alert(
            t("auth.resetFailed"),
            err?.response?.data?.message || t("common.errorFallback"),
          );
        },
      },
    );
  };

  return (
    <ThemedSafeAreaView>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ThemedView style={styles.container}>
          <BouncingPressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color={theme.text} size={24} />
          </BouncingPressable>

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t("auth.resetPassword")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("auth.resetPasswordDesc")}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="token"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("auth.token")}
                  placeholder="Masukkan token"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.token?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="new_password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("auth.newPassword")}
                  placeholder="Minimal 8 karakter"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.new_password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("auth.confirmPassword")}
                  placeholder="Ulangi password baru"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirm_password?.message}
                />
              )}
            />

            <Button
              title={t("auth.resetPassword")}
              onPress={handleSubmit(onSubmit)}
              isLoading={resetMutation.isPending}
              style={styles.button}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  backButton: { position: "absolute", top: 60, left: 20, zIndex: 10 },
  header: { marginBottom: 40, alignItems: "center" },
  title: { marginBottom: 8, textAlign: "center" },
  subtitle: { textAlign: "center", opacity: 0.7 },
  form: { gap: 4 },
  button: { marginTop: 24 },
});
