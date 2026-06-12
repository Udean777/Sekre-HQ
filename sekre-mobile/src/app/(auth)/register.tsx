import { View, Text, Alert, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegister } from '@/hooks/use-auth';
import { registerSchema, RegisterFormValues } from '@/core/validations/auth.validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();

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
      onError: (error: any) => {
        Alert.alert('Registrasi Gagal', error?.response?.data?.message || 'Terjadi kesalahan');
      },
      onSuccess: () => {
        Alert.alert('Berhasil', 'Registrasi organisasi berhasil!');
        router.replace('/(app)');
      },
    });
  };

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8 items-center">
        <Text className="text-3xl font-bold text-foreground text-center">Bentuk Himpunan</Text>
        <Text className="text-muted-foreground mt-2 text-center">
          Daftarkan organisasi Anda dan mulai berkolaborasi
        </Text>
      </View>

      <View className="space-y-4">
        <Controller
          control={control}
          name="organization_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nama Organisasi"
              placeholder="BEM Universitas X"
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
              placeholder="himaped-web"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.subdomain?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nama Anda (Pemilik)"
              placeholder="John Doe"
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
          className="mt-6"
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
        >
          Daftar Sekarang
        </Button>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted-foreground">Sudah mendaftarkan organisasi? </Text>
          <Link href="/(auth)/login" className="text-primary font-semibold">
            Masuk
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
