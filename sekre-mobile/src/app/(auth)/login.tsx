import { View, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/AppText';
import { SocialButton } from '@/components/ui/SocialButton';
import { useLogin } from '@/hooks/use-auth';
import { loginSchema, LoginFormValues } from '@/core/validations/auth.validation';
import { Eye, EyeOff } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { AxiosError } from 'axios';

export default function LoginScreen() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onError: (error) => {
        const axiosError = error as AxiosError<{ message?: string }>;
        Alert.alert('Login Gagal', axiosError.response?.data?.message || 'Email atau password salah');
      },
      onSuccess: () => {
        router.replace('/(app)');
      },
    });
  };

  const handleGoogleLogin = () => {
    Alert.alert('Segera Hadir', 'Login dengan Google akan segera tersedia.');
  };

  const handleAppleLogin = () => {
    Alert.alert('Segera Hadir', 'Login dengan Apple akan segera tersedia.');
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Area */}
      <View className="flex-1 px-6 pt-20 pb-10">

        {/* Logo / Brand */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-blue-600 items-center justify-center mb-5">
            <AppText variant="h1" className="text-white text-2xl">S</AppText>
          </View>
          <AppText variant="h1" className="text-center text-[28px] tracking-tight">
            Selamat Datang
          </AppText>
          <AppText variant="body" className="text-center text-gray-500 dark:text-gray-400 mt-1.5">
            Masuk ke ruang kerja organisasi Anda
          </AppText>
        </View>

        {/* OAuth Buttons */}
        <View className="gap-y-3 mb-6">
          <SocialButton provider="google" onPress={handleGoogleLogin} />
          {Platform.OS === 'ios' && (
            <SocialButton provider="apple" onPress={handleAppleLogin} />
          )}
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <AppText variant="caption" className="mx-4 text-gray-400 dark:text-gray-500">
            atau masuk dengan email
          </AppText>
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </View>

        {/* Form Card */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl px-5 py-6 border border-gray-100 dark:border-gray-800"
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
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="nama@organisasi.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
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
                placeholder="Masukkan password Anda"
                secureTextEntry={!showPassword}
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
                      ? <EyeOff size={18} color={isDark ? '#6b7280' : '#9ca3af'} />
                      : <Eye size={18} color={isDark ? '#6b7280' : '#9ca3af'} />
                    }
                  </TouchableOpacity>
                }
              />
            )}
          />

          {/* Forgot Password */}
          <TouchableOpacity className="self-end mb-4 -mt-2">
            <AppText variant="body" className="text-blue-600 dark:text-blue-400 text-xs font-medium">
              Lupa password?
            </AppText>
          </TouchableOpacity>

          <Button
            onPress={handleSubmit(onSubmit)}
            isLoading={isPending}
            className="rounded-xl"
            size="lg"
          >
            Masuk
          </Button>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8">
          <AppText variant="body" className="text-gray-500 dark:text-gray-400">
            Belum punya akun?{' '}
          </AppText>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <AppText variant="body" className="text-blue-600 dark:text-blue-400 font-semibold">
                Daftar Organisasi
              </AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
