import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
import { eventSchema, type EventFormValues } from '@shared/utils/eventSchemas';
import { useCreateEventMutation } from '@hooks/events/useCreateEventMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { EventsStackParamList } from '@app/navigation/EventsNavigator';

type Props = NativeStackScreenProps<EventsStackParamList, 'CreateEvent'>;

export const CreateEventScreen: React.FC<Props> = ({ navigation }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mutate: createEvent, isPending } = useCreateEventMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: '', description: '', location: '', startDate: '', endDate: '' },
  });

  const onSubmit = (values: EventFormValues): void => {
    setGlobalError(null);
    createEvent(
      {
        title: values.title,
        description: values.description || undefined,
        location: values.location || undefined,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error: Error) => {
          setGlobalError(isDomainError(error) ? error.message : 'Terjadi kesalahan. Coba lagi nanti.');
        },
      },
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <AppText variant="h3" style={styles.title}>Buat Acara</AppText>

          {globalError ? (
            <View style={styles.errorBanner}>
              <AppText variant="bodySm" color={colors.danger.main}>{globalError}</AppText>
            </View>
          ) : null}

          <View style={styles.form}>
            <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Judul" placeholder="Masukkan judul acara" returnKeyType="next" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
            )} />
            <Controller control={control} name="location" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Lokasi (opsional)" placeholder="Masukkan lokasi acara" returnKeyType="next" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.location?.message} />
            )} />
            <Controller control={control} name="startDate" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Tanggal Mulai" placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" returnKeyType="next" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.startDate?.message} />
            )} />
            <Controller control={control} name="endDate" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Tanggal Selesai (opsional)" placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" returnKeyType="next" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.endDate?.message} />
            )} />
            <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Deskripsi (opsional)" placeholder="Masukkan deskripsi acara" multiline numberOfLines={4} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} />
            )} />
          </View>

          <Button label="Buat Acara" variant="primary" size="lg" fullWidth loading={isPending} onPress={handleSubmit(onSubmit)} />
          <Button label="Batal" variant="ghost" size="lg" fullWidth onPress={() => navigation.goBack()} style={styles.cancelButton} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollContent: { padding: spacing[4], paddingBottom: spacing[10] },
  title: { marginBottom: spacing[5] },
  errorBanner: { backgroundColor: colors.danger.light, borderRadius: 8, padding: spacing[3], marginBottom: spacing[4] },
  form: { gap: spacing[4], marginBottom: spacing[6] },
  cancelButton: { marginTop: spacing[2] },
});
