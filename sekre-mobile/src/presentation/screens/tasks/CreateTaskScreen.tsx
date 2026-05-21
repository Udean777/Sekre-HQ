import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { colors, spacing } from '@presentation/theme';
import { taskSchema, type TaskFormValues } from '@shared/utils/taskSchemas';
import { useCreateTaskMutation } from '@hooks/tasks/useCreateTaskMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { TasksStackParamList } from '@app/navigation/TasksNavigator';
import type { TaskPriority } from '@core/domain/entities/Task';

type Props = NativeStackScreenProps<TasksStackParamList, 'CreateTask'>;

const PRIORITY_OPTIONS: Array<{ label: string; value: TaskPriority }> = [
  { label: 'Rendah', value: 'LOW' },
  { label: 'Sedang', value: 'MEDIUM' },
  { label: 'Tinggi', value: 'HIGH' },
  { label: 'Mendesak', value: 'URGENT' },
];

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: colors.neutral[400],
  MEDIUM: colors.info.main,
  HIGH: colors.warning.main,
  URGENT: colors.danger.main,
};

export const CreateTaskScreen: React.FC<Props> = ({ navigation }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mutate: createTask, isPending } = useCreateTaskMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: '',
    },
  });

  const onSubmit = (values: TaskFormValues): void => {
    setGlobalError(null);
    createTask(
      {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        dueDate: values.dueDate || undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error: Error) => {
          if (isDomainError(error)) {
            setGlobalError(error.message);
          } else {
            setGlobalError('Terjadi kesalahan. Coba lagi nanti.');
          }
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
          <AppText variant="h3" style={styles.title}>
            Buat Tugas
          </AppText>

          {globalError ? (
            <View style={styles.errorBanner}>
              <AppText variant="bodySm" color={colors.danger.main}>
                {globalError}
              </AppText>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Title */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Judul"
                  placeholder="Masukkan judul tugas"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                />
              )}
            />

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Deskripsi (opsional)"
                  placeholder="Masukkan deskripsi tugas"
                  multiline
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                />
              )}
            />

            {/* Priority */}
            <Controller
              control={control}
              name="priority"
              render={({ field: { onChange, value } }) => (
                <View>
                  <AppText variant="label" style={styles.fieldLabel}>
                    Prioritas
                  </AppText>
                  <View style={styles.priorityRow}>
                    {PRIORITY_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        style={[
                          styles.priorityChip,
                          value === opt.value && {
                            backgroundColor: PRIORITY_COLOR[opt.value],
                            borderColor: PRIORITY_COLOR[opt.value],
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <AppText
                          variant="bodySm"
                          color={value === opt.value ? colors.text.inverse : colors.text.secondary}
                        >
                          {opt.label}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.priority ? (
                    <AppText variant="bodySm" color={colors.danger.main}>
                      {errors.priority.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />

            {/* Due date */}
            <Controller
              control={control}
              name="dueDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Tenggat (opsional)"
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.dueDate?.message}
                />
              )}
            />
          </View>

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

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  title: {
    marginBottom: spacing[5],
  },
  errorBanner: {
    backgroundColor: colors.danger.light,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  form: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  fieldLabel: {
    marginBottom: spacing[2],
    color: colors.text.primary,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  priorityChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  cancelButton: {
    marginTop: spacing[2],
  },
});
