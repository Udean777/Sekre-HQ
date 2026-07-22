import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useAlert } from "@/shared/context/alert-context";
import { extractErrorMessage } from "@/shared/lib/utils/error";

import { useCreateMember } from "@/features/member/use-create-member";
import { UserRole } from "@/features/member/use-members";

// Schema for manual member creation
const createMemberSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  full_name: z.string().min(2, "Nama lengkap harus diisi"),
  role: z.enum(["ADMIN", "MEMBER"] as const),
});

export default function CreateMemberScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { alert } = useAlert();
  const createMemberMutation = useCreateMember();

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    role: "MEMBER" as UserRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreate = () => {
    try {
      createMemberSchema.parse(form);
      setErrors({});

      createMemberMutation.mutate(form, {
        onSuccess: () => {
          alert(t("division.success"), t("members.createSuccess"));
          router.back();
        },
        onError: (err: any) => {
          alert(
            t("division.error"),
            extractErrorMessage(err, t("members.createError"))
          );
        },
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        (e as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedHeader title={t("members.createTitle")} showBackButton />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedCard style={styles.card}>
          <ThemedText style={styles.description}>
            {t("members.createDesc")}
          </ThemedText>

          <Input
            label={t("members.fullName")}
            placeholder={t("profile.namePlaceholder")}
            value={form.full_name}
            onChangeText={(text) => setForm({ ...form, full_name: text })}
            error={errors.full_name}
          />

          <Input
            label={t("members.email")}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            error={errors.email}
          />

          <View style={styles.roleContainer}>
            <ThemedText style={styles.roleLabel}>{t("members.role")}</ThemedText>
            <View style={styles.roleButtons}>
              <View style={styles.roleButtonContainer}>
                <Button
                  title={t("common.member")}
                  variant={form.role === "MEMBER" ? "primary" : "outline"}
                  onPress={() => setForm({ ...form, role: "MEMBER" })}
                />
              </View>
              <View style={styles.roleButtonContainer}>
                <Button
                  title={t("common.admin")}
                  variant={form.role === "ADMIN" ? "primary" : "outline"}
                  onPress={() => setForm({ ...form, role: "ADMIN" })}
                />
              </View>
            </View>
          </View>
        </ThemedCard>

        <Button
          title={t("members.createMember")}
          onPress={handleCreate}
          isLoading={createMemberMutation.isPending}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    gap: 16,
    padding: 20,
  },
  description: {
    marginBottom: 8,
    opacity: 0.8,
  },
  roleContainer: {
    gap: 8,
    marginTop: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  roleButtonContainer: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 8,
  },
});
