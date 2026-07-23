import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { useAlert } from "@/shared/context/alert-context";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { extractErrorMessage } from "@/shared/lib/utils/error";
import { useTransaction } from "@/features/finance/use-transaction";
import { useDeleteTransaction } from "@/features/finance/use-delete-transaction";
import { useDivision } from "@/features/division/use-divisions";
import { formatMoney } from "@/features/finance/ui/finance-summary-card";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrashIcon,
  CalendarBlank,
  Building,
  Note,
} from "phosphor-react-native";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { alert } = useAlert();

  const { data: transaction, isLoading } = useTransaction(id);
  const { data: division } = useDivision(transaction?.division_id ?? "");
  const deleteMutation = useDeleteTransaction();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={theme.tint} size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedHeader
          title={t("finance.detailTitle")}
          showBackButton
          withSafeArea={false}
        />
        <ThemedText>Transaksi tidak ditemukan</ThemedText>
      </View>
    );
  }

  const isIncome = transaction.type === "INCOME";
  const dateStr = new Date(transaction.created_at).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDelete = () => {
    alert(t("common.delete"), t("finance.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("finance.delete"),
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              router.back();
            },
            onError: (error: any) => {
              alert(
                t("common.error"),
                extractErrorMessage(error, t("finance.deleteError")),
              );
            },
          });
        },
      },
    ]);
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedHeader
        title={t("finance.detailTitle")}
        showBackButton
        withSafeArea={false}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Type Badge + Amount */}
          <ThemedCard style={styles.amountCard}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: isIncome
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.1)",
                },
              ]}
            >
              {isIncome ? (
                <ArrowDownLeft color="#22c55e" size={24} weight="bold" />
              ) : (
                <ArrowUpRight color="#ef4444" size={24} weight="bold" />
              )}
              <ThemedText
                style={{
                  color: isIncome ? "#22c55e" : "#ef4444",
                  fontWeight: "700",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {isIncome ? t("finance.income") : t("finance.expense")}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.amount,
                { color: isIncome ? "#22c55e" : "#ef4444" },
              ]}
            >
              {isIncome ? "+" : "-"}{" "}
              {formatMoney(
                transaction.amount.amount_cents,
                transaction.amount.currency,
              )}
            </ThemedText>
          </ThemedCard>

          {/* Detail Info */}
          <ThemedCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Note color={theme.textSecondary} size={20} weight="duotone" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>
                  {t("finance.description")}
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {transaction.description}
                </ThemedText>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Building
                  color={theme.textSecondary}
                  size={20}
                  weight="duotone"
                />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>
                  {t("finance.division")}
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {division?.division?.name ?? "—"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <CalendarBlank
                  color={theme.textSecondary}
                  size={20}
                  weight="duotone"
                />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>
                  {t("finance.date")}
                </ThemedText>
                <ThemedText style={styles.infoValue}>{dateStr}</ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Delete Button */}
          <Pressable
            onPress={handleDelete}
            style={styles.deleteButton}
            disabled={deleteMutation.isPending}
          >
            <TrashIcon color="#ef4444" size={20} weight="duotone" />
            <ThemedText style={styles.deleteText}>
              {deleteMutation.isPending
                ? t("common.loading")
                : t("finance.delete")}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  amountCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 44,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
    gap: 2,
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "rgba(150,150,150,0.15)",
    marginVertical: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  deleteText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },
});
