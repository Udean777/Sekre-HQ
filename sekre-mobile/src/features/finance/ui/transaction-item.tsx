import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/shared/ui/themed-text";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import type { Transaction } from "@/shared/types/finance.types";
import { ArrowDownLeft, ArrowUpRight } from "phosphor-react-native";
import { formatMoney } from "./finance-summary-card";

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: Props) {
  const theme = useTheme();
  const isIncome = transaction.type === "INCOME";

  const dateStr = new Date(transaction.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Pressable
      style={[
        styles.container,
        { borderBottomColor: theme.backgroundSelected },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isIncome
              ? "rgba(34, 197, 94, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
          },
        ]}
      >
        {isIncome ? (
          <ArrowDownLeft color="#22c55e" size={20} weight="bold" />
        ) : (
          <ArrowUpRight color="#ef4444" size={20} weight="bold" />
        )}
      </View>

      <View style={styles.contentContainer}>
        <ThemedText style={styles.description} numberOfLines={1}>
          {transaction.description}
        </ThemedText>
        <ThemedText style={styles.date}>{dateStr}</ThemedText>
      </View>

      <View style={styles.amountContainer}>
        <ThemedText
          style={[styles.amount, { color: isIncome ? "#22c55e" : "#ef4444" }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {isIncome ? "+" : "-"}{" "}
          {formatMoney(
            transaction.amount.amount_cents,
            transaction.amount.currency,
          )}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  description: {
    fontSize: 15,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  amountContainer: {
    alignItems: "flex-end",
    flexShrink: 0.5,
    paddingLeft: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: "bold",
  },
});
