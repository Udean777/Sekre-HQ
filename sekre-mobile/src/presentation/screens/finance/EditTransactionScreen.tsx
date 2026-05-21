import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { colors, spacing } from '@presentation/theme';
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from '@shared/utils/financeSchemas';
import { useTransactionQuery } from '@hooks/finance/useTransactionQuery';
import { useUpdateTransactionMutation } from '@hooks/finance/useUpdateTransactionMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { FinanceStackParamList } from '@app/navigation/FinanceNavigator';

type Props = NativeStackScreenProps<FinanceStackParamList, 'EditTransaction'>;

const TYPE_OPTIONS: Array<{ label: string; value: 'INCOME' | 'EXPENSE' }> = [
  { label: 'Pemasukan', value: 'INCOME' },
  { label: 'Pengeluaran', value: 'EXPENSE' },
];

export const EditTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transactionId } = route.params;
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { data: tx, isLoading } = useTransactionQuery(transactionId);
  const { mutate: updateTransaction, isPending } = useUpdateTransactionMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTransactionSchema) as any,
    values: tx
      ? {
          divisionId: tx.divisionId,
          eventId: tx.eventId ?? '',
          type: tx.type,
          amountCents: tx.amount.amountCents,
          currency: tx.amount.currency,
          description: tx.description,
          receiptUrl: tx.receiptUrl ?? '',
        }
      : undefined,
  });

  const selectedType = watch('type');

  const onSubmit = (values: CreateTransactionFormValues): void => {
    setGlobalError(null);
    updateTransaction(
      {
        id: transactionId,
        params: {
          divisionId: values.divisionId,
          type: values.type,
          amountCents: values.amountCents,
          currency: values.currency ?? 'IDR',
          description: values.description,
          eventId: values.eventId || undefined,
          receiptUrl: values.receiptUrl || undefined,
        },
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error: Error) => {
          setGlobalError(
            isDomainError(error) ? error.message : 'Terjadi kesalahan. Coba lagi nanti.',
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="h3" style={styles.title}>
            Edit Transaksi
          </AppText>

          {globalError ? (
            <View style={styles.errorBanner}>
              <AppText variant="bodySm" color={colors.danger.main}>
                {globalError}
              </AppText>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Type Selector */}
            <View>
              <AppText variant="label" style={styles.fieldLabel}>
                Tipe Transaksi
              </AppText>
              <View style={styles.typeRow}>
                {TYPE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setValue('type', opt.value)}
                    activeOpacity={0.7}
                    style={[styles.typeChip, selectedType === opt.value && styles.typeChipActive]}
                  >
                    <AppText
                      variant="bodyMd"
                      color={selectedType === opt.value ? colors.neutral[0] : colors.text.secondary}
                    >
                      {opt.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.type ? (
                <AppText variant="bodySm" color={colors.danger.main}>
                  {errors.type.message}
                </AppText>
              ) : null}
            </View>

            <Controller
              control={control}
              name="divisionId"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="ID Divisi"
                  placeholder="UUID divisi"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.divisionId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="amountCents"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nominal (dalam sen)"
                  placeholder="Contoh: 5000000 = Rp 50.000"
                  keyboardType="numeric"
                  returnKeyType="next"
                  value={value === 0 ? '' : String(value)}
                  onChangeText={text => onChange(text ? parseInt(text, 10) : 0)}
                  onBlur={onBlur}
                  error={errors.amountCents?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="currency"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Mata Uang"
                  placeholder="IDR"
                  autoCapitalize="characters"
                  maxLength={3}
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.currency?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Deskripsi"
                  placeholder="Masukkan deskripsi transaksi"
                  multiline
                  numberOfLines={3}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="eventId"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="ID Acara (opsional)"
                  placeholder="UUID acara terkait"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.eventId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="receiptUrl"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="URL Bukti (opsional)"
                  placeholder="https://..."
                  keyboardType="url"
                  autoCapitalize="none"
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.receiptUrl?.message}
                />
              )}
            />
          </View>

          <Button
            label="Simpan Perubahan"
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onPress={handleSubmit(onSubmit)}
          />
          <Button
            label="Batal"
            variant="ghost"
            size="lg"
            fullWidth
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollContent: { padding: spacing[4], paddingBottom: spacing[10] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { marginBottom: spacing[5] },
  errorBanner: {
    backgroundColor: colors.danger.light,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  form: { gap: spacing[4], marginBottom: spacing[6] },
  fieldLabel: { marginBottom: spacing[2] },
  typeRow: { flexDirection: 'row', gap: spacing[3] },
  typeChip: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  cancelButton: { marginTop: spacing[2] },
});
