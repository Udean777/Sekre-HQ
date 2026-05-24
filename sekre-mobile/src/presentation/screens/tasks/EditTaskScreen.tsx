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
import { taskSchema, type TaskFormValues } from '@shared/utils/taskSchemas';
import { useTaskQuery } from '@hooks/tasks/useTaskQuery';
import { useUpdateTaskMutation } from '@hooks/tasks/useUpdateTaskMutation';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { useDivisionMembersOptions } from '@hooks/divisions/useDivisionMembersOptions';
import { flattenPages } from '@shared/utils/infiniteQueryHelpers';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { TasksStackParamList } from '@app/navigation/TasksNavigator';

type Props = NativeStackScreenProps<TasksStackParamList, 'EditTask'>;

// ─── Screen ──────────────────────────────────────────────────────────────────

export const EditTaskScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { data: task, isLoading } = useTaskQuery(taskId);
  const { mutate: updateTask, isPending } = useUpdateTaskMutation();
  const { data: divisionsData, isLoading: divisionsLoading } = useDivisionsQuery({ pageSize: 100 });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    values: task
      ? {
          title: task.title,
          description: task.description ?? '',
          divisionId: task.divisionId ?? '',
          assigneeId: task.assigneeId ?? null,
          dueDate: task.dueDate ?? null,
        }
      : undefined,
  });

  const selectedDivisionId = watch('divisionId');
  const { options: assigneeOptions, isLoading: assigneeLoading } =
    useDivisionMembersOptions(selectedDivisionId || null);

  const divisionOptions: SelectOption[] =
    flattenPages(divisionsData).map(d => ({
      label: d.name,
      value: d.id,
      description: d.description ?? undefined,
    }));

  const onSubmit = (values: TaskFormValues): void => {
    setGlobalError(null);
    updateTask(
      {
        id: taskId,
        params: {
          title: values.title,
          description: values.description || undefined,
          status: task?.status,
          assigneeId: values.assigneeId ?? null,
          dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
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

  // ── Loading data tugas ──
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
            <AppText variant="h3">Edit Tugas</AppText>
            {task ? (
              <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
                {task.title}
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
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Judul Tugas"
                  placeholder="Masukkan judul tugas"
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
