import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ThemedScrollView } from "@/shared/ui/themed-scroll-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useAlert } from "@/shared/context/alert-context";
import { extractErrorMessage } from "@/shared/lib/utils/error";
import { useAuthStore } from "@/shared/store/auth-store";

import {
  divisionSchema,
  type DivisionFormData,
} from "@/features/division/division.schema";
import { useCreateDivision } from "@/features/division/use-create-division";

export default function CreateDivisionScreen() {
  const router = useRouter();
  const { alert } = useAlert();
  const role = useAuthStore((state) => state.role);
  const isAdminOrOwner = role === "ADMIN" || role === "OWNER";

  const createDivisionMutation = useCreateDivision();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DivisionFormData>({
    resolver: zodResolver(divisionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: DivisionFormData) => {
    createDivisionMutation.mutate(data, {
      onSuccess: () => {
        alert("Berhasil", "Divisi baru berhasil dibuat.");
        router.back();
      },
      onError: (error: any) => {
        alert(
          "Gagal",
          extractErrorMessage(error, "Terjadi kesalahan saat membuat divisi."),
        );
      },
    });
  };

  if (!isAdminOrOwner) {
    return (
      <View style={styles.centered}>
        <ThemedText>Anda tidak memiliki akses ke halaman ini.</ThemedText>
      </View>
    );
  }

  return (
    <>
      <ThemedHeader title="Buat Divisi Baru" showBackButton />

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
            title="Simpan"
            onPress={handleSubmit(onSubmit)}
            isLoading={createDivisionMutation.isPending}
            style={styles.saveButton}
          />
        </ThemedCard>
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
});
