import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedText } from "@/shared/ui/themed-text";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import type { FinanceSummary } from "@/shared/types/finance.types";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "phosphor-react-native";

interface Props {
  summary: FinanceSummary;
}

export function formatMoney(cents: number, currency: string = "IDR") {
  const amount = cents / 100;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinanceSummaryCard({ summary }: Props) {
  const theme = useTheme();

  return (
    <ThemedCard style={styles.container}>
      <View style={styles.balanceContainer}>
        <View style={styles.balanceHeader}>
          <Wallet color={theme.textSecondary} size={20} />
          <ThemedText style={styles.balanceLabel}>Total Saldo</ThemedText>
        </View>
        <ThemedText 
          style={styles.balanceAmount}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatMoney(summary.balance.amount_cents, summary.balance.currency)}
        </ThemedText>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(34, 197, 94, 0.1)" },
            ]}
          >
            <ArrowDownLeft color="#22c55e" size={20} weight="bold" />
          </View>
          <View style={styles.statTextContainer}>
            <ThemedText style={styles.statLabel}>Pemasukan</ThemedText>
            <ThemedText 
              style={[styles.statAmount, { color: "#22c55e" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(summary.total_income.amount_cents, summary.total_income.currency)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statBox}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(239, 68, 68, 0.1)" },
            ]}
          >
            <ArrowUpRight color="#ef4444" size={20} weight="bold" />
          </View>
          <View style={styles.statTextContainer}>
            <ThemedText style={styles.statLabel}>Pengeluaran</ThemedText>
            <ThemedText 
              style={[styles.statAmount, { color: "#ef4444" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(summary.total_expense.amount_cents, summary.total_expense.currency)}
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 38,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(150,150,150,0.15)",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  statTextContainer: {
    flex: 1,
  },
  iconBox: {
    padding: 10,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  statAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
