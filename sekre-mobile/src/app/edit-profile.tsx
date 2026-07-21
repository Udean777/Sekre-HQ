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
import { useAuthStore } from "../shared/store/auth-store";
import { useUpdateProfile } from "../features/user/use-update-profile";
import { useTheme } from "../shared/lib/hooks/use-theme";
import { useAlert } from "../shared/context/alert-context";
import {
  profileSchema,
  type ProfileFormData,
} from "../features/user/user.schema";

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { alert } = useAlert();
  const user = useAuthStore((state) => state.user);
  const updateMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        alert("Berhasil", "Profil Anda telah diperbarui.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      },
      onError: (error: any) => {
        alert(
          "Gagal",
          error.response?.data?.message || "Terjadi kesalahan sistem.",
        );
      },
    });
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedHeader
        title="Ubah Profil"
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
              name="full_name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nama Lengkap"
                  placeholder="Masukkan nama lengkap Anda"
                  value={value}
                  onChangeText={onChange}
                  error={errors.full_name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Alamat Email"
                  placeholder="anda@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              title="Simpan Perubahan"
              onPress={handleSubmit(onSubmit)}
              isLoading={updateMutation.isPending}
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
