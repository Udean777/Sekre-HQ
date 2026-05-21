import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { colors, spacing } from '@presentation/theme';
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
    <Screen scrollable padded>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText variant="h2">Selamat Datang</AppText>
          <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
            Masuk ke akun Sekre Anda
          </AppText>
        </View>

        {/* Global error */}
        {globalError ? (
          <View style={styles.errorBanner}>
            <AppText variant="bodySm" color={colors.danger.main}>
              {globalError}
            </AppText>
          </View>
        ) : null}

        {/* Form */}
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
                  >
                    <AppText variant="label" color={colors.primary[500]}>
                      {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </AppText>
                  </TouchableOpacity>
                }
              />
            )}
          />
        </View>

        {/* Submit */}
        <Button
          label="Masuk"
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
        />

        {/* Register link */}
        <View style={styles.footer}>
          <AppText variant="bodyMd" color={colors.text.secondary}>
            Belum punya akun?{' '}
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <AppText variant="bodyMd" color={colors.primary[500]}>
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
  header: {
    marginTop: spacing[8],
    marginBottom: spacing[6],
    gap: spacing[1],
  },
  subtitle: {
    marginTop: spacing[1],
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
  submitButton: {
    marginBottom: spacing[4],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[2],
  },
});
