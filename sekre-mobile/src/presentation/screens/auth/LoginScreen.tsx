import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { loginSchema, type LoginFormValues } from '@shared/utils/authSchemas';
import { useLoginMutation } from '@hooks/auth/useLoginMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { AuthStackParamList } from '@app/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { mutate: login, isPending } = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues): void => {
    setGlobalError(null);
    login(
      { email: values.email, password: values.password },
      {
        onError: (error: Error) => {
          setGlobalError(
            isDomainError(error) ? error.message : 'Terjadi kesalahan. Coba lagi nanti.',
          );
        },
      },
    );
  };

  return (
    <Screen scrollable padded edges={['top']} noTabBar>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* ── Branding ── */}
        <View style={styles.branding}>
          <View style={styles.logoBox}>
            <Ionicons name="layers-outline" size={36} color={colors.primary[500]} />
          </View>
          <AppText variant="h1" style={styles.appName}>
            Sekre
          </AppText>
        </View>

        {/* ── Header ── */}
        <View style={styles.header}>
          <AppText variant="h2">Selamat Datang</AppText>
          <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
            Masuk ke akun Sekre Anda
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
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="contoh@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Kata Sandi"
                placeholder="Masukkan kata sandi"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(prev => !prev)}
                    accessibilityLabel={
                      showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                }
              />
            )}
          />
        </View>

        {/* ── Submit ── */}
        <Button
          label="Masuk"
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
        />

        {/* ── Register link ── */}
        <View style={styles.footer}>
          <AppText variant="bodyMd" color={colors.text.secondary}>
            Belum punya akun?{' '}
          </AppText>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <AppText variant="bodyMd" color={colors.primary[500]} style={styles.footerLink}>
              Daftar
            </AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  // Branding
  branding: {
    alignItems: 'center',
    marginTop: spacing[10],
    marginBottom: spacing[6],
    gap: spacing[2],
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: colors.primary[600],
    fontWeight: fontWeight.bold,
  },

  // Header
  header: {
    marginBottom: spacing[6],
    gap: spacing[1],
  },
  subtitle: {
    marginTop: spacing[1],
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.danger.light,
    borderRadius: 10,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    flex: 1,
  },

  // Form
  form: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },

  // Submit
  submitButton: {
    marginBottom: spacing[4],
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[2],
    paddingBottom: spacing[6],
  },
  footerLink: {
    fontWeight: fontWeight.semiBold,
  },
});
