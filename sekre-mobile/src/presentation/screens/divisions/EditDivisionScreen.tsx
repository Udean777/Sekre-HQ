import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { colors, spacing } from '@presentation/theme';
import { divisionSchema, type DivisionFormValues } from '@shared/utils/divisionSchemas';
import { useDivisionQuery } from '@hooks/divisions/useDivisionQuery';
import { useUpdateDivisionMutation } from '@hooks/divisions/useUpdateDivisionMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { DivisionsStackParamList } from '@app/navigation/DivisionsNavigator';

type Props = NativeStackScreenProps<DivisionsStackParamList, 'EditDivision'>;

export const EditDivisionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { divisionId } = route.params;
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { data: division } = useDivisionQuery(divisionId);
  const { mutate: updateDivision, isPending } = useUpdateDivisionMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionSchema),
    values: division
      ? {
          name: division.name,
          description: division.description ?? '',
        }
      : undefined,
  });

  const onSubmit = (values: DivisionFormValues): void => {
    setGlobalError(null);
    updateDivision(
      {
        id: divisionId,
        params: {
          name: values.name,
          description: values.description || undefined,
        },
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
            Edit Divisi
          </AppText>

          {globalError ? (
            <View style={styles.errorBanner}>
              <AppText variant="bodySm" color={colors.danger.main}>
                {globalError}
              </AppText>
            </View>
          ) : null}

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Divisi"
                  placeholder="Masukkan nama divisi"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Deskripsi (opsional)"
                  placeholder="Masukkan deskripsi divisi"
                  multiline
                  numberOfLines={3}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
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
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  title: { marginBottom: spacing[5] },
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
  cancelButton: { marginTop: spacing[2] },
});
