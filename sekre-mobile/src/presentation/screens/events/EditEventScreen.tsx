import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { DatePickerField } from '@presentation/components/DatePickerField';
import { SelectField } from '@presentation/components/SelectField';
import type { SelectOption } from '@presentation/components/SelectField';
import { colors, spacing } from '@presentation/theme';
import { eventSchema, type EventFormValues } from '@shared/utils/eventSchemas';
import { useEventQuery } from '@hooks/events/useEventQuery';
import { useUpdateEventMutation } from '@hooks/events/useUpdateEventMutation';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { flattenPages } from '@shared/utils/infiniteQueryHelpers';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { EventsStackParamList } from '@app/navigation/EventsNavigator';

type Props = NativeStackScreenProps<EventsStackParamList, 'EditEvent'>;

// Konversi Date ke RFC3339 untuk backend
const toRFC3339 = (date: Date): string => date.toISOString();

export const EditEventScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eventId } = route.params;
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { data: event, isLoading } = useEventQuery(eventId);
  const { mutate: updateEvent, isPending } = useUpdateEventMutation();
  const { data: divisionsData, isLoading: divisionsLoading } = useDivisionsQuery({ pageSize: 100 });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    values: event
      ? {
          divisionId: event.divisionId ?? '',
          title: event.title,
          description: event.description ?? '',
          location: event.location ?? '',
          startDate: event.startDate,
          endDate: event.endDate ?? new Date(),
        }
      : undefined,
  });

  const divisionOptions: SelectOption[] = flattenPages(divisionsData).map(d => ({
    label: d.name,
    value: d.id,
  }));

  const onSubmit = (values: EventFormValues): void => {
    setGlobalError(null);
    updateEvent(
      {
        id: eventId,
        params: {
          divisionId: values.divisionId,
          title: values.title,
          description: values.description || undefined,
          location: values.location || undefined,
          startDate: toRFC3339(values.startDate),
          endDate: toRFC3339(values.endDate),
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

  // ── Loading data event ──
  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
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
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="pencil-outline" size={28} color={colors.primary[500]} />
            </View>
            <AppText variant="h3">Edit Acara</AppText>
            {event ? (
              <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
                {event.title}
              </AppText>
            ) : null}
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
            <Controller
              control={control}
              name="divisionId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Divisi"
                  placeholder="Pilih divisi"
                  options={divisionOptions}
                  value={value}
                  onChange={onChange}
                  loading={divisionsLoading}
                  error={errors.divisionId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Judul Acara"
                  placeholder="Masukkan judul acara"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Lokasi (opsional)"
                  placeholder="Masukkan lokasi acara"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.location?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  label="Tanggal & Waktu Mulai"
                  value={value ?? null}
                  onChange={onChange}
                  mode="datetime"
                  error={errors.startDate?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="endDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  label="Tanggal & Waktu Selesai"
                  value={value ?? null}
                  onChange={onChange}
                  mode="datetime"
                  error={errors.endDate?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Deskripsi (opsional)"
                  placeholder="Jelaskan detail acara ini"
                  multiline
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                />
              )}
            />
          </View>

          {/* ── Actions ── */}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
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
  cancelButton: { marginTop: spacing[2] },
});
