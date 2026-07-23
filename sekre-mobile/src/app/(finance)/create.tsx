import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedText } from "@/shared/ui/themed-text";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useAlert } from "@/shared/context/alert-context";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { extractErrorMessage } from "@/shared/lib/utils/error";

import {
  transactionSchema,
  type TransactionFormValues,
} from "@/features/finance/finance.schema";
import { useCreateTransaction } from "@/features/finance/use-create-transaction";
import { useFinanceSummary } from "@/features/finance/use-finance-summary";
import { formatMoney } from "@/features/finance/ui/finance-summary-card";
import { useDivisions } from "@/features/division/use-divisions";
import { Select } from "@/shared/ui/select";
import { ArrowDownLeft, ArrowUpRight, WarningCircle } from "phosphor-react-native";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";

export default function CreateTransactionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { alert } = useAlert();

  const createMutation = useCreateTransaction();
  const { data: summary } = useFinanceSummary();
  const { data: divisions } = useDivisions();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      currency: "IDR",
      amount: "",
      description: "",
      division_id: "",
    },
  });

  const selectedType = watch("type");
  const amountValue = watch("amount");
  const isIncome = selectedType === "INCOME";

  const balanceCents = summary?.balance?.amount_cents ?? 0;
  const amountCents = Math.round(parseFloat(amountValue || "0") * 100);
  const balanceCheck = (() => {
    if (isIncome) return null;
    if (balanceCents === 0) return "empty";
    if (!amountValue) return null;
    if (amountCents > balanceCents) return "insufficient";
    if (amountCents === balanceCents) return "deplete";
    return null;
  })();

  const onSubmit = (data: TransactionFormValues) => {
    // Convert string amount to cents
    const amountFloat = parseFloat(data.amount);
    const amount_cents = Math.round(amountFloat * 100);

    createMutation.mutate(
      {
        division_id: data.division_id,
        type: data.type,
        amount_cents: amount_cents,
        currency: data.currency,
        description: data.description,
        event_id: data.event_id || null,
        receipt_url: data.receipt_url || null,
      },
      {
        onSuccess: () => {
          alert("Berhasil", t("finance.createSuccess"));
          router.back();
        },
        onError: (error) => {
          alert("Gagal", extractErrorMessage(error, t("finance.createError")));
        },
      },
    );
  };

  const divisionOptions =
    divisions?.pages
      ?.flatMap((page) => page.data)
      .map((div: any) => ({
        label: div.name,
        value: div.id,
      })) || [];

  return (
    <ThemedSafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedHeader
        title={t("finance.createTitle")}
        showBackButton
        withSafeArea={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <Button
            title={t("finance.income")}
            variant={isIncome ? "success" : "outline-secondary"}
            style={styles.typeButton}
            onPress={() => setValue("type", "INCOME")}
          />
          <Button
            title={t("finance.expense")}
            variant={!isIncome ? "danger" : "outline-secondary"}
            style={styles.typeButton}
            onPress={() => setValue("type", "EXPENSE")}
            disabled={balanceCents === 0}
          />
        </View>

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Input
                label={t("finance.amount")}
                placeholder={t("finance.amountPlaceholder")}
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.amount?.message}
              />
              {balanceCheck === "insufficient" && (
                <View style={styles.balanceRow}>
                  <WarningCircle color="#ef4444" size={14} weight="fill" />
                  <ThemedText style={styles.balanceError}>
                    {t("finance.insufficientBalance", {
                      balance: formatMoney(balanceCents),
                    })}
                  </ThemedText>
                </View>
              )}
              {balanceCheck === "deplete" && (
                <View style={styles.balanceRow}>
                  <WarningCircle color="#d97706" size={14} weight="fill" />
                  <ThemedText style={styles.balanceWarning}>
                    {t("finance.willDeplete", {
                      balance: formatMoney(balanceCents),
                    })}
                  </ThemedText>
                </View>
              )}
              {balanceCheck === "empty" && (
                <View style={styles.balanceRow}>
                  <WarningCircle color="#ef4444" size={14} weight="fill" />
                  <ThemedText style={styles.balanceError}>
                    {t("finance.balanceEmpty")}
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("finance.description")}
              placeholder={t("finance.descriptionPlaceholder")}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.description?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="division_id"
          render={({ field: { onChange, value } }) => (
            <Select
              label={t("finance.division")}
              value={value}
              onValueChange={onChange}
              options={divisionOptions}
              placeholder={t("finance.divisionPlaceholder")}
              error={errors.division_id?.message}
            />
          )}
        />

        <View style={styles.footer}>
          <Button
            title={t("finance.save")}
            onPress={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending}
            disabled={balanceCheck === "empty" || balanceCheck === "insufficient"}
            variant={isIncome ? "success" : "danger"}
          />
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
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
  typeSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  balanceError: {
    color: "#ef4444",
    fontSize: 12,
    flexShrink: 1,
  },
  balanceWarning: {
    color: "#d97706",
    fontSize: 12,
    flexShrink: 1,
  },
  footer: {
    marginTop: 24,
  },
});
