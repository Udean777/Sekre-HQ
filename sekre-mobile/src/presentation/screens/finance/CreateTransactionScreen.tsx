import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SelectField } from '@presentation/components/SelectField';
import type { SelectOption } from '@presentation/components/SelectField';
import { CurrencyInput } from '@presentation/components/CurrencyInput';
import { colors, spacing, fontWeight } from '@presentation/theme';
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from '@shared/utils/financeSchemas';
import { useCreateTransactionMutation } from '@hooks/finance/useCreateTransactionMutation';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { useEventsQuery } from '@hooks/events/useEventsQuery';
import { flattenPages } from '@shared/utils/infiniteQueryHelpers';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { FinanceStackParamList } from '@app/navigation/FinanceNavigator';
import {
  getCurrencyFromLocale,
  getLocale,
} from '@presentation/components/CurrencyInput/CurrencyInput';

type Props = NativeStackScreenProps<FinanceStackParamList, 'CreateTransaction'>;

// ─── Type Selector ────────────────────────────────────────────────────────────

const TYPE_OPTIONS: Array<{
  label: string;
  value: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
}> = [
  { label: 'Pemasukan', value: 'INCOME', icon: 'arrow-down-outline', color: colors.success.main },
  { label: 'Pengeluaran', value: 'EXPENSE', icon: 'arrow-up-outline', color: colors.danger.main },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export const CreateTransactionScreen: React.FC<Props> = ({ navigation }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mutate: createTransaction, isPending } = useCreateTransactionMutation();
  const { data: divisionsData, isLoading: divisionsLoading } = useDivisionsQuery({ pageSize: 100 });
  const { data: eventsData, isLoading: eventsLoading } = useEventsQuery({ pageSize: 100 });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
    resolver: zodResolver(createTransactionSchema) as any,
    defaultValues: {
      divisionId: '',
      eventId: '',
      type: 'EXPENSE',
      amountRupiah: 0,
      currency: getCurrencyFromLocale(getLocale()),
      description: '',
      receiptUrl: '',
    },
  });

  const selectedType = watch('type');

  const divisionOptions: SelectOption[] = flattenPages(divisionsData).map(d => ({
    label: d.name,
    value: d.id,
  }));

  const eventOptions: SelectOption[] = flattenPages(eventsData).map(e => ({
    label: e.title,
    value: e.id,
  }));

  const onSubmit = (values: CreateTransactionFormValues): void => {
    setGlobalError(null);
    createTransaction(
      {
        divisionId: values.divisionId,
        type: values.type,
        // Konversi rupiah → sen (× 100)
        amountCents: values.amountRupiah * 100,
        currency: values.currency ?? 'IDR',
        description: values.description,
        eventId: values.eventId || undefined,
        receiptUrl: values.receiptUrl || undefined,
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
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="receipt-outline" size={28} color={colors.primary[500]} />
            </View>
            <AppText variant="h3">Tambah Transaksi</AppText>
            <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
              Catat pemasukan atau pengeluaran organisasi
            </AppText>
          </View>

          {/* ── Error banner ── */}
          {globalError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger.main} />
              <AppText variant="bodySm" color={colors.danger.main} style={styles.errorText}>
                {globalError}
              </AppText>
            </View>
          ) : null}

          {/* ── Form ── */}
          <View style={styles.form}>
            {/* Type selector */}
            <View>
              <AppText variant="label" color={colors.text.secondary} style={styles.fieldLabel}>
                Tipe Transaksi
              </AppText>
              <View style={styles.typeRow}>
                {TYPE_OPTIONS.map(opt => {
                  const active = selectedType === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setValue('type', opt.value)}
                      activeOpacity={0.7}
                      style={[
                        styles.typeChip,
                        active && { backgroundColor: opt.color, borderColor: opt.color },
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={18}
                        color={active ? colors.neutral[0] : opt.color}
                      />
                      <AppText
                        variant="bodyMd"
                        color={active ? colors.neutral[0] : colors.text.secondary}
                        style={styles.typeLabel}
                      >
                        {opt.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.type ? (
                <AppText variant="bodySm" color={colors.danger.main} style={styles.fieldError}>
                  {errors.type.message}
                </AppText>
              ) : null}
            </View>

            <Controller
              control={control}
              name="amountRupiah"
              render={({ field: { onChange, value } }) => (
                <Controller
                  control={control}
                  name="currency"
                  render={({ field: { onChange: onCurrencyChange, value: currencyValue } }) => (
                    <CurrencyInput
                      label="Nominal"
                      value={value}
                      onChange={onChange}
                      currency={currencyValue ?? 'IDR'}
                      onCurrencyChange={onCurrencyChange}
                      error={errors.amountRupiah?.message}
                    />
                  )}
                />
              )}
            />

            <Controller
              control={control}
              name="divisionId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Divisi"
                  placeholder="Pilih divisi"
                  options={divisionOptions}
                  value={value || null}
                  onChange={onChange}
                  loading={divisionsLoading}
                  error={errors.divisionId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="eventId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Acara (opsional)"
                  placeholder="Pilih acara terkait"
                  options={eventOptions}
                  value={value || null}
                  onChange={onChange}
                  loading={eventsLoading}
                  optional
                  error={errors.eventId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Deskripsi"
                  placeholder="Contoh: Pembelian ATK Divisi IPTEK"
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

          {/* ── Actions ── */}
          <Button
            label="Simpan Transaksi"
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[6],
    marginTop: spacing[2],
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  subtitle: { textAlign: 'center' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.danger.light,
    borderRadius: 10,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: { flex: 1 },
  form: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  fieldLabel: { marginBottom: spacing[2] },
  fieldError: { marginTop: spacing[1] },
  typeRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  typeLabel: { fontWeight: fontWeight.medium },
  cancelButton: { marginTop: spacing[2] },
});
