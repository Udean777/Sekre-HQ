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
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="lock-closed-outline" size={28} color={colors.primary[500]} />
            </View>
            <AppText variant="h3">Ganti Password</AppText>
            <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
              Pastikan password baru Anda kuat dan mudah diingat
            </AppText>
          </View>

          {/* ── Error banner ── */}
          {globalError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger.main} />
              <AppText variant="bodySm" color={colors.danger.main} style={styles.bannerText}>
                {globalError}
              </AppText>
            </View>
          ) : null}

          {/* ── Success banner ── */}
          {success ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.success.dark} />
              <AppText variant="bodySm" color={colors.success.dark} style={styles.bannerText}>
                Password berhasil diubah.
              </AppText>
            </View>
          ) : null}

          {/* ── Form ── */}
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
                  onSubmitEditing={handleSubmit(onSubmit)}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>

          {/* ── Actions ── */}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },

  // Header
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
  },

  // Banners
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.danger.light,
    borderRadius: 10,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.success.light,
    borderRadius: 10,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  bannerText: {
    flex: 1,
  },

  // Form
  form: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },

  // Actions
  cancelButton: {
    marginTop: spacing[2],
  },
});
