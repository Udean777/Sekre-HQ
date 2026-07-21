import React from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowLeftIcon } from "phosphor-react-native";

import { ThemedSafeAreaView } from "../shared/ui/themed-safe-area";
import { ThemedHeader } from "../shared/ui/themed-header";
import { ThemedView } from "../shared/ui/themed-view";
import { Input } from "../shared/ui/input";
import { Button } from "../shared/ui/button";
import { BouncingPressable } from "../shared/ui/bouncing-pressable";
import { useChangePassword } from "../features/user/use-change-password";
import { useTheme } from "../shared/lib/hooks/use-theme";
import { useAlert } from "../shared/context/alert-context";
import {
  passwordSchema,
  type PasswordFormData,
} from "../features/user/user.schema";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { alert } = useAlert();
  const changePasswordMutation = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          alert("Berhasil", "Kata sandi Anda telah berhasil diubah.", [
            { text: "OK", onPress: () => router.back() },
          ]);
          reset();
        },
        onError: (error: any) => {
          alert(
            "Gagal",
            error.response?.data?.message ||
              "Terjadi kesalahan sistem saat mengubah kata sandi.",
          );
        },
      },
    );
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedHeader
        title="Ganti Kata Sandi"
        withSafeArea={false}
        left={
          <BouncingPressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeftIcon color={theme.text} size={24} />
          </BouncingPressable>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.formContainer}>
            <Controller
              control={control}
              name="current_password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Kata Sandi Saat Ini"
                  placeholder="Masukkan kata sandi lama Anda"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.current_password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="new_password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Kata Sandi Baru"
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
                  label="Konfirmasi Kata Sandi"
                  placeholder="Ulangi kata sandi baru"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirm_password?.message}
                />
              )}
            />

            <Button
              title="Perbarui Kata Sandi"
              onPress={handleSubmit(onSubmit)}
              isLoading={changePasswordMutation.isPending}
              style={styles.submitButton}
            />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  formContainer: {
    gap: 16,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
  },
});
