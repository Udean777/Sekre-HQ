import { View, Text, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/hooks/use-auth';
import { loginSchema, LoginFormValues } from '@/core/validations/auth.validation';

export default function LoginScreen() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

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
      onError: (error: any) => {
        Alert.alert('Login Gagal', error?.response?.data?.message || 'Email atau password salah');
      },
      onSuccess: () => {
        router.replace('/(app)');
      },
    });
  };

  return (
    <View className="flex-1 justify-center px-6 bg-background">
      <View className="mb-10 items-center">
        <Text className="text-3xl font-bold text-foreground">Selamat Datang</Text>
        <Text className="text-muted-foreground mt-2 text-center">
          Silakan masuk ke akun Sekre Anda
        </Text>
      </View>

      <View className="space-y-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="nama@organisasi.com"
              keyboardType="email-address"
              autoCapitalize="none"
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
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          className="mt-4"
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
        >
          Masuk
        </Button>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted-foreground">Belum punya akun? </Text>
          <Link href="/(auth)/register" className="text-primary font-semibold">
            Daftar Organisasi
          </Link>
        </View>
      </View>
    </View>
  );
}
