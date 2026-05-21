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
import { changePasswordSchema, type ChangePasswordFormValues } from '@shared/utils/settingsSchemas';
import { useChangePasswordMutation } from '@hooks/auth/useChangePasswordMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { SettingsStackParamList } from '@app/navigation/SettingsNavigator';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { mutate: changePassword, isPending } = useChangePasswordMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: ChangePasswordFormValues): void => {
    setGlobalError(null);
    setSuccess(false);
    changePassword(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          reset();
        },
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
          <AppText variant="h3" style={styles.title}>
            Ganti Password
          </AppText>

          {globalError ? (
            <View style={styles.errorBanner}>
              <AppText variant="bodySm" color={colors.danger.main}>
                {globalError}
              </AppText>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBanner}>
              <AppText variant="bodySm" color={colors.success.dark}>
                Password berhasil diubah.
              </AppText>
            </View>
          ) : null}

          <View style={styles.form}>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password Saat Ini"
                  placeholder="Masukkan password saat ini"
                  secureTextEntry
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.currentPassword?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password Baru"
                  placeholder="Minimal 8 karakter"
                  secureTextEntry
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.newPassword?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Konfirmasi Password Baru"
                  placeholder="Ulangi password baru"
                  secureTextEntry
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>

          <Button
            label="Ganti Password"
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
  title: { marginBottom: spacing[5] },
  errorBanner: {
    backgroundColor: colors.danger.light,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  successBanner: {
    backgroundColor: colors.success.light,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  form: { gap: spacing[4], marginBottom: spacing[6] },
  cancelButton: { marginTop: spacing[2] },
});
