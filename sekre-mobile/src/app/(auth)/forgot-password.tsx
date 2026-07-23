import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { useForgotPassword } from "@/features/auth/use-forgot-password";
import { useAlert } from "@/shared/context/alert-context";
import {
  forgotPasswordSchema,
  type ForgotPasswordForm,
} from "@/features/auth/auth.schema";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { ArrowLeft } from "phosphor-react-native";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const forgotMutation = useForgotPassword();
  const { alert } = useAlert();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotMutation.mutate(data, {
      onSuccess: (res) => {
        router.push(`/(auth)/reset-password?token=${encodeURIComponent(res.token)}` as any);
      },
      onError: (err: any) => {
        alert(
          t("auth.sendFailed"),
          err?.response?.data?.message || t("common.errorFallback"),
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
          <BouncingPressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color={theme.text} size={24} />
          </BouncingPressable>

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t("auth.forgotPasswordTitle")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("auth.forgotPasswordDesc")}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("members.email")}
                  placeholder="admin@sekre.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              title={t("auth.sendResetLink")}
              onPress={handleSubmit(onSubmit)}
              isLoading={forgotMutation.isPending}
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
