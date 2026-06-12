import { View, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/AppText';
import { SocialButton } from '@/components/ui/SocialButton';
import { useRegister } from '@/hooks/use-auth';
import { registerSchema, RegisterFormValues } from '@/core/validations/auth.validation';
import { Eye, EyeOff, Building2, User, Globe, Mail, Lock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { AxiosError } from 'axios';

export default function RegisterScreen() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organization_name: '',
      subdomain: '',
      full_name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    register(data, {
      onError: (error) => {
        const axiosError = error as AxiosError<{ message?: string }>;
        Alert.alert('Registrasi Gagal', axiosError.response?.data?.message || 'Terjadi kesalahan');
      },
      onSuccess: () => {
        Alert.alert('Berhasil! 🎉', 'Organisasi Anda berhasil dibuat. Selamat datang di Sekre!');
        router.replace('/(app)');
      },
    });
  };

  const handleGoogleRegister = () => {
    Alert.alert('Segera Hadir', 'Daftar dengan Google akan segera tersedia.');
  };

  const handleAppleRegister = () => {
    Alert.alert('Segera Hadir', 'Daftar dengan Apple akan segera tersedia.');
  };

  const iconColor = isDark ? '#6b7280' : '#9ca3af';

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerStyle={{ paddingTop: 64, paddingBottom: 40, paddingHorizontal: 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-2xl bg-blue-600 items-center justify-center mb-5">
          <AppText variant="h1" className="text-white text-2xl">S</AppText>
        </View>
        <AppText variant="h1" className="text-center text-[28px] tracking-tight">
          Bentuk Himpunan
        </AppText>
        <AppText variant="body" className="text-center text-gray-500 dark:text-gray-400 mt-1.5">
          Daftarkan organisasi Anda dan mulai berkolaborasi
        </AppText>
      </View>

      {/* OAuth Buttons */}
      <View className="gap-y-3 mb-6">
        <SocialButton provider="google" onPress={handleGoogleRegister} />
        {Platform.OS === 'ios' && (
          <SocialButton provider="apple" onPress={handleAppleRegister} />
        )}
      </View>

      {/* Divider */}
      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <AppText variant="caption" className="mx-4 text-gray-400 dark:text-gray-500">
          atau daftar dengan email
        </AppText>
        <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Form Card: Informasi Organisasi */}
      <AppText variant="label" className="mb-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs px-1">
        Informasi Organisasi
      </AppText>
      <View
        className="bg-white dark:bg-gray-900 rounded-2xl px-5 py-5 border border-gray-100 dark:border-gray-800 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.06,
          shadowRadius: 12,
          elevation: isDark ? 0 : 3,
        }}
      >
        <Controller
          control={control}
          name="organization_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nama Organisasi"
              placeholder="BEM Universitas X"
              leftIcon={<Building2 size={18} color={iconColor} />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.organization_name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="subdomain"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Subdomain (URL Khusus)"
              placeholder="nama-organisasi"
              autoCapitalize="none"
              leftIcon={<Globe size={18} color={iconColor} />}
              helperText="Digunakan untuk identifikasi unik organisasi Anda"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.subdomain?.message}
            />
          )}
        />
      </View>

      {/* Form Card: Informasi Akun */}
      <AppText variant="label" className="mb-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs px-1">
        Informasi Akun Pemilik
      </AppText>
      <View
        className="bg-white dark:bg-gray-900 rounded-2xl px-5 py-5 border border-gray-100 dark:border-gray-800 mb-6"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.06,
          shadowRadius: 12,
          elevation: isDark ? 0 : 3,
        }}
      >
        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nama Lengkap"
              placeholder="John Doe"
              leftIcon={<User size={18} color={iconColor} />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.full_name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="nama@organisasi.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={<Mail size={18} color={iconColor} />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="Minimal 8 karakter"
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={18} color={iconColor} />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword
                    ? <EyeOff size={18} color={iconColor} />
                    : <Eye size={18} color={iconColor} />
                  }
                </TouchableOpacity>
              }
            />
          )}
        />
      </View>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        isLoading={isPending}
        className="rounded-xl"
        size="lg"
      >
        Buat Akun Sekarang
      </Button>

      {/* Footer */}
      <View className="flex-row justify-center mt-8">
        <AppText variant="body" className="text-gray-500 dark:text-gray-400">
          Sudah punya akun?{' '}
        </AppText>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <AppText variant="body" className="text-blue-600 dark:text-blue-400 font-semibold">
              Masuk
            </AppText>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Terms & Privacy */}
      <AppText variant="caption" align="center" className="mt-4 text-gray-400 dark:text-gray-500 px-4">
        Dengan mendaftar, Anda menyetujui{' '}
        <AppText variant="caption" className="text-blue-500 dark:text-blue-400">
          Syarat & Ketentuan
        </AppText>
        {' '}serta{' '}
        <AppText variant="caption" className="text-blue-500 dark:text-blue-400">
          Kebijakan Privasi
        </AppText>
        {' '}kami.
      </AppText>
    </ScrollView>
  );
}
