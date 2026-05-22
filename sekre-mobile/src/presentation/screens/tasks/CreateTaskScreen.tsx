import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
import { taskSchema, type TaskFormValues } from '@shared/utils/taskSchemas';
import { useCreateTaskMutation } from '@hooks/tasks/useCreateTaskMutation';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { useDivisionMembersOptions } from '@hooks/divisions/useDivisionMembersOptions';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { TasksStackParamList } from '@app/navigation/TasksNavigator';

type Props = NativeStackScreenProps<TasksStackParamList, 'CreateTask'>;

// ─── Screen ──────────────────────────────────────────────────────────────────

export const CreateTaskScreen: React.FC<Props> = ({ navigation }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mutate: createTask, isPending } = useCreateTaskMutation();
  const { data: divisionsData, isLoading: divisionsLoading } = useDivisionsQuery({ limit: 100 });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      divisionId: '',
      assigneeId: null,
      dueDate: null,
    },
  });

  const selectedDivisionId = watch('divisionId');
  const { options: assigneeOptions, isLoading: assigneeLoading } = useDivisionMembersOptions(
    selectedDivisionId || null,
  );

  const divisionOptions: SelectOption[] =
    divisionsData?.divisions.map(d => ({
      label: d.name,
      value: d.id,
      description: d.description ?? undefined,
    })) ?? [];

  const onSubmit = (values: TaskFormValues): void => {
    setGlobalError(null);
    createTask(
      {
        title: values.title,
        description: values.description || undefined,
        divisionId: values.divisionId,
        assigneeId: values.assigneeId ?? undefined,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
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
              <Ionicons name="add-circle-outline" size={28} color={colors.primary[500]} />
            </View>
            <AppText variant="h3">Buat Tugas</AppText>
            <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
              Tambahkan tugas baru untuk tim Anda
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
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Judul Tugas"
                  placeholder="Contoh: Buat laporan bulanan"
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
              name="divisionId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Divisi"
                  value={value || null}
                  onChange={onChange}
                  options={divisionOptions}
                  placeholder="Pilih divisi"
                  loading={divisionsLoading}
                  error={errors.divisionId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="assigneeId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Penanggung Jawab"
                  value={value ?? null}
                  onChange={onChange}
                  options={assigneeOptions}
                  placeholder={
                    selectedDivisionId
                      ? assigneeOptions.length === 0 && !assigneeLoading
                        ? 'Divisi belum punya anggota'
                        : 'Pilih anggota divisi'
                      : 'Pilih divisi terlebih dahulu'
                  }
                  loading={assigneeLoading}
                  optional
                  error={errors.assigneeId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="dueDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  label="Tenggat"
                  value={value ?? null}
                  onChange={onChange}
                  mode="date"
                  minimumDate={new Date()}
                  optional
                  error={errors.dueDate?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Deskripsi (opsional)"
                  placeholder="Jelaskan detail tugas ini"
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
            label="Buat Tugas"
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
  cancelButton: { marginTop: spacing[2] },
});
