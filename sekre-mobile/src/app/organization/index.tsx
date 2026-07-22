import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, BuildingsIcon, TrashIcon } from "phosphor-react-native";

import { ThemedScrollView } from "@/shared/ui/themed-scroll-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useAlert } from "@/shared/context/alert-context";
import { extractErrorMessage } from "@/shared/lib/utils/error";
import { useAuthStore } from "@/shared/store/auth-store";

import {
  organizationSchema,
  type OrganizationFormData,
} from "@/features/organization/organization.schema";
import { useUpdateOrganization } from "@/features/organization/use-update-organization";
import { useDeleteOrganization } from "@/features/organization/use-delete-organization";
import { Alert } from "react-native";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";

export default function OrganizationScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { alert } = useAlert();

  const organization = useAuthStore((state) => state.organization);
  const role = useAuthStore((state) => state.role);

  const updateOrganizationMutation = useUpdateOrganization();
  const deleteOrganizationMutation = useDeleteOrganization();

  const isOwner = role === "OWNER";
  const isAdminOrOwner = role === "OWNER" || role === "ADMIN";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || "",
    },
  });

  const onSubmit = (data: OrganizationFormData) => {
    updateOrganizationMutation.mutate(data, {
      onSuccess: () => {
        alert("Berhasil", "Profil organisasi berhasil diperbarui.");
      },
      onError: (error: any) => {
        alert(
          "Gagal",
          extractErrorMessage(error, "Terjadi kesalahan saat menyimpan."),
        );
      },
    });
  };

  const handleDeleteOrganization = () => {
    Alert.alert(
      "Hapus Organisasi",
      "Apakah Anda yakin ingin menghapus organisasi ini secara PERMANEN? Semua data yang terkait (member, dll) akan terhapus. Tindakan ini tidak dapat dibatalkan.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteOrganizationMutation.mutate(undefined, {
              onSuccess: () => {
                alert("Berhasil", "Organisasi berhasil dihapus.");
                // Store will clear and navigate to root on logout inside hook
              },
              onError: (error: any) => {
                alert(
                  "Gagal",
                  extractErrorMessage(
                    error,
                    "Terjadi kesalahan saat menghapus organisasi.",
                  ),
                );
              },
            });
          },
        },
      ],
    );
  };

  if (!isAdminOrOwner) {
    return (
      <ThemedScrollView contentContainerStyle={styles.centered}>
        <ThemedText>Anda tidak memiliki akses ke halaman ini.</ThemedText>
      </ThemedScrollView>
    );
  }

  return (
    <>
      <ThemedHeader title="Pengaturan Organisasi" showBackButton />

      <ThemedScrollView contentContainerStyle={styles.container}>
        <ThemedCard style={styles.card}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.tint + "1A" },
              ]}
            >
              <BuildingsIcon size={40} color={theme.tint} weight="fill" />
            </View>
          </View>

          <View style={styles.formSection}>
            <ThemedText type="smallBold" style={styles.label}>
              Nama Organisasi
            </ThemedText>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Masukkan nama organisasi"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />
          </View>

          <Button
            title="Simpan Perubahan"
            onPress={handleSubmit(onSubmit)}
            isLoading={updateOrganizationMutation.isPending}
            style={styles.saveButton}
          />
        </ThemedCard>

        {isOwner && (
          <View style={styles.dangerZone}>
            <ThemedText type="smallBold" style={styles.dangerTitle}>
              Zona Berbahaya
            </ThemedText>
            <ThemedCard style={styles.dangerCard}>
              <ThemedText style={styles.dangerText}>
                Menghapus organisasi akan menghapus semua data yang terkait di
                dalamnya secara permanen.
              </ThemedText>
              <Button
                title="Hapus Organisasi"
                variant="danger-outline"
                onPress={handleDeleteOrganization}
                isLoading={deleteOrganizationMutation.isPending}
                style={styles.deleteButton}
              />
            </ThemedCard>
          </View>
        )}
      </ThemedScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 8,
  },
  dangerZone: {
    marginTop: 16,
  },
  dangerTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  dangerCard: {
    padding: 16,
    borderColor: "#EF444433",
    borderWidth: 1,
  },
  dangerText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    marginTop: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});
