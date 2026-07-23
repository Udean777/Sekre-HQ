import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useTransactions } from "@/features/finance/use-transactions";
import { useFinanceSummary } from "@/features/finance/use-finance-summary";
import { FinanceSummaryCard } from "@/features/finance/ui/finance-summary-card";
import { TransactionItem } from "@/features/finance/ui/transaction-item";
import type { Transaction } from "@/shared/types/finance.types";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { PlusCircleIcon } from "phosphor-react-native";
import { useRouter } from "expo-router";

export default function FinanceScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const { data: summary, isLoading: isLoadingSummary } = useFinanceSummary();
  const {
    data: transactions,
    isLoading: isLoadingList,
    refetch,
    isRefetching,
  } = useTransactions({
    page: 1,
    page_size: 50,
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {isLoadingSummary ? (
        <ActivityIndicator color={theme.tint} />
      ) : summary ? (
        <FinanceSummaryCard summary={summary} />
      ) : null}
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">{t("finance.history")}</ThemedText>
      </View>
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
      <ThemedHeader
        title={t("finance.title") || "Finance"}
        right={
          <BouncingPressable
            onPress={() => router.push("/(finance)/create")}
            style={{ padding: 8, marginRight: -8 }}
          >
            <PlusCircleIcon color={theme.text} size={24} weight="fill" />
          </BouncingPressable>
        }
      />

      {isLoadingList ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.tint} size="large" />
        </View>
      ) : (
        <FlashList<Transaction>
          data={transactions || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => router.push(`/(finance)/${item.id}` as any)}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          // @ts-ignore
          estimatedItemSize={70}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={{ color: theme.textSecondary }}>
                {t("finance.empty")}
              </ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 16,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
});
