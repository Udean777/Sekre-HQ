import React, { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash, Buildings } from "phosphor-react-native";

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

const AVATAR_COLORS = ["#4F46E5", "#059669", "#D97706", "#DC2626", "#7C3AED"];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function EditDivisionScreen() {
  const { t } = useTranslation();
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
    defaultValues: { name: "", description: "" },
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
        alert(t("division.success"), t("divisions.saveSuccess"));
        router.back();
      },
      onError: (err: any) =>
        alert(
          t("division.error"),
          extractErrorMessage(err, t("divisions.saveError")),
        ),
    });
  };

  const handleDelete = () => {
    Alert.alert(t("divisions.deleteDiv"), t("divisions.deleteConfirm"), [
      { text: t("divisions.cancel"), style: "cancel" },
      {
        text: t("divisions.delete"),
        style: "destructive",
        onPress: () =>
          deleteDivisionMutation.mutate(id!, {
            onSuccess: () => {
              alert(t("division.success"), t("divisions.deleteSuccess"));
              router.replace("/divisions");
            },
            onError: (err: any) =>
              alert(
                t("division.error"),
                extractErrorMessage(err, t("divisions.deleteError")),
              ),
          }),
      },
    ]);
  };

  if (!isAdminOrOwner) {
    return (
      <View style={styles.center}>
        <ThemedText>Anda tidak memiliki akses ke halaman ini.</ThemedText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <>
        <ThemedHeader title={t("divisions.edit")} showBackButton />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <ThemedHeader title={t("divisions.edit")} showBackButton />
        <View style={styles.center}>
          <Buildings color={theme.textSecondary} size={40} weight="thin" />
          <ThemedText style={styles.errorText}>
            {extractErrorMessage(error, t("divisions.loadError"))}
          </ThemedText>
        </View>
      </>
    );
  }

  const accent = getColor(division?.division.name || "");

  return (
    <>
      <ThemedHeader title={t("divisions.edit")} showBackButton />

      <ThemedScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={[styles.heroAvatar, { backgroundColor: accent + "18" }]}>
            <Buildings color={accent} size={28} weight="bold" />
          </View>
          <ThemedText style={styles.heroName}>
            {division?.division.name}
          </ThemedText>
        </View>

        <ThemedCard style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>
            Informasi Divisi
          </ThemedText>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("divisions.name")}
                placeholder={t("divisions.namePlaceholder")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("divisions.desc")}
                placeholder={t("divisions.descPlaceholder")}
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

          <Button
            title={t("divisions.saveChanges")}
            onPress={handleSubmit(onSubmit)}
            isLoading={updateDivisionMutation.isPending}
            style={styles.saveButton}
          />
        </ThemedCard>

        {division && <DivisionMembersManager division={division} />}

        <View style={styles.dangerSection}>
          <ThemedText style={styles.dangerTitle}>
            {t("profile.dangerZone")}
          </ThemedText>
          <ThemedCard style={styles.dangerCard}>
            <View style={styles.dangerBody}>
              <Trash color="#DC2626" size={20} />
              <ThemedText style={styles.dangerText}>
                {t("divisions.deleteWarning")}
              </ThemedText>
            </View>
            <Button
              title={t("divisions.deleteDiv")}
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
  container: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  errorText: { fontSize: 14, opacity: 0.6, textAlign: "center" },
  hero: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heroName: { fontSize: 20, fontWeight: "700" },
  sectionCard: { padding: 18, gap: 4, borderRadius: 14, marginBottom: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.5,
    marginBottom: 12,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  saveButton: { marginTop: 12 },
  dangerSection: { marginTop: 24 },
  dangerTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  dangerCard: {
    padding: 16,
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 14,
    gap: 14,
  },
  dangerBody: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  dangerText: { fontSize: 14, opacity: 0.8, lineHeight: 20, flex: 1 },
  deleteButton: { marginTop: 4 },
});
