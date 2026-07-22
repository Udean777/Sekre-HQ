import React, { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "phosphor-react-native";

import { ThemedScrollView } from "@/shared/ui/themed-scroll-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useAlert } from "@/shared/context/alert-context";
import { extractErrorMessage } from "@/shared/lib/utils/error";
import { useAuthStore } from "@/shared/store/auth-store";
import { useTheme } from "@/shared/lib/hooks/use-theme";

import {
  divisionSchema,
  type DivisionFormData,
} from "@/features/division/division.schema";
import { useDivision } from "@/features/division/use-divisions";
import { useUpdateDivision } from "@/features/division/use-update-division";
import { useDeleteDivision } from "@/features/division/use-delete-division";
import { DivisionMembersManager } from "@/features/division/ui/division-members-manager";

export default function EditDivisionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { alert } = useAlert();
  const theme = useTheme();

  const role = useAuthStore((state) => state.role);
  const isAdminOrOwner = role === "ADMIN" || role === "OWNER";

  const { data: division, isLoading, isError, error } = useDivision(id!);
  const updateDivisionMutation = useUpdateDivision(id!);
  const deleteDivisionMutation = useDeleteDivision();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DivisionFormData>({
    resolver: zodResolver(divisionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (division) {
      reset({
        name: division.division.name,
        description: division.division.description || "",
      });
    }
  }, [division, reset]);

  const onSubmit = (data: DivisionFormData) => {
    updateDivisionMutation.mutate(data, {
      onSuccess: () => {
        alert("Berhasil", "Data divisi berhasil diperbarui.");
        router.back();
      },
      onError: (err: any) => {
        alert(
          "Gagal",
          extractErrorMessage(err, "Terjadi kesalahan saat menyimpan."),
        );
      },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Hapus Divisi",
      "Apakah Anda yakin ingin menghapus divisi ini? Tindakan ini tidak dapat dibatalkan.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteDivisionMutation.mutate(id!, {
              onSuccess: () => {
                alert("Berhasil", "Divisi berhasil dihapus.");
                router.replace("/divisions");
              },
              onError: (err: any) => {
                alert(
                  "Gagal",
                  extractErrorMessage(
                    err,
                    "Terjadi kesalahan saat menghapus divisi.",
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
      <View style={styles.centered}>
        <ThemedText>Anda tidak memiliki akses ke halaman ini.</ThemedText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <>
        <ThemedHeader title="Edit Divisi" showBackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <ThemedHeader title="Edit Divisi" showBackButton />
        <View style={styles.centered}>
          <ThemedText style={{ color: theme.text }}>
            {extractErrorMessage(error, "Gagal memuat divisi.")}
          </ThemedText>
        </View>
      </>
    );
  }

  return (
    <>
      <ThemedHeader title="Edit Divisi" showBackButton />

      <ThemedScrollView contentContainerStyle={styles.container}>
        <ThemedCard style={styles.card}>
          <View style={styles.formSection}>
            <ThemedText type="smallBold" style={styles.label}>
              Nama Divisi
            </ThemedText>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Masukkan nama divisi"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />
          </View>

          <View style={styles.formSection}>
            <ThemedText type="smallBold" style={styles.label}>
              Deskripsi (Opsional)
            </ThemedText>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Penjelasan singkat divisi"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
              )}
            />
          </View>

          <Button
            title="Simpan Perubahan"
            onPress={handleSubmit(onSubmit)}
            isLoading={updateDivisionMutation.isPending}
            style={styles.saveButton}
          />
        </ThemedCard>

        {division && <DivisionMembersManager division={division} />}

        <View style={styles.dangerZone}>
          <ThemedText type="smallBold" style={styles.dangerTitle}>
            Zona Berbahaya
          </ThemedText>
          <ThemedCard style={styles.dangerCard}>
            <ThemedText style={styles.dangerText}>
              Menghapus divisi akan melepaskan semua anggota yang ada di
              dalamnya. Data yang dihapus tidak dapat dikembalikan.
            </ThemedText>
            <Button
              title="Hapus Divisi"
              variant="danger-outline"
              onPress={handleDelete}
              isLoading={deleteDivisionMutation.isPending}
              style={styles.deleteButton}
            />
          </ThemedCard>
        </View>
      </ThemedScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 8,
  },
  dangerZone: {
    marginTop: 24,
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
});
