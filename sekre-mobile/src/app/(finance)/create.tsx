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
import { useDivisions } from "@/features/division/use-divisions";
import { Select } from "@/shared/ui/select";
import { ArrowDownLeft, ArrowUpRight } from "phosphor-react-native";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";

export default function CreateTransactionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { alert } = useAlert();

  const createMutation = useCreateTransaction();
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
  const isIncome = selectedType === "INCOME";

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
          alert("Berhasil", "Transaksi berhasil ditambahkan");
          router.back();
        },
        onError: (error) => {
          alert(
            "Gagal",
            extractErrorMessage(error, "Gagal menambahkan transaksi"),
          );
        },
      },
    );
  };

  const divisionOptions = divisions?.pages?.flatMap(page => page.data).map((div: any) => ({
    label: div.name,
    value: div.id,
  })) || [];

  return (
    <ThemedSafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedHeader title="Tambah Transaksi" showBackButton withSafeArea={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <Button
            title="Pemasukan"
            variant={isIncome ? "success" : "outline-secondary"}
            style={styles.typeButton}
            onPress={() => setValue("type", "INCOME")}
          />
          <Button
            title="Pengeluaran"
            variant={!isIncome ? "danger" : "outline-secondary"}
            style={styles.typeButton}
            onPress={() => setValue("type", "EXPENSE")}
          />
        </View>

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Jumlah"
              placeholder="0"
              keyboardType="decimal-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.amount?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Keterangan"
              placeholder="Contoh: Pembelian alat tulis"
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
              label="Divisi"
              value={value}
              onValueChange={onChange}
              options={divisionOptions}
              placeholder="Pilih Divisi"
              error={errors.division_id?.message}
            />
          )}
        />

        <View style={styles.footer}>
          <Button
            title="Simpan Transaksi"
            onPress={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending}
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
  footer: {
    marginTop: 24,
  },
});
