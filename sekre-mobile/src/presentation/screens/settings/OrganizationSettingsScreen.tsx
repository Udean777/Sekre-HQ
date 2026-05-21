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
import { Card } from '@presentation/components/Card';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { organizationSchema, type OrganizationFormValues } from '@shared/utils/settingsSchemas';
import { useUpdateOrganizationMutation } from '@hooks/auth/useUpdateOrganizationMutation';
import { useAppSelector } from '@store/hooks';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { SettingsStackParamList } from '@app/navigation/SettingsNavigator';

type Props = NativeStackScreenProps<SettingsStackParamList, 'OrganizationSettings'>;

export const OrganizationSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const organization = useAppSelector(state => state.auth.organization);
  const { mutate: updateOrganization, isPending } = useUpdateOrganizationMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name ?? '',
    },
  });

  const onSubmit = (values: OrganizationFormValues): void => {
    setGlobalError(null);
    setSuccess(false);
    updateOrganization(
      { name: values.name },
      {
        onSuccess: () => {
          setSuccess(true);
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
            Pengaturan Organisasi
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
                Organisasi berhasil diperbarui.
              </AppText>
            </View>
          ) : null}

          {/* Read-only info */}
          <Card style={styles.infoCard}>
            <AppText variant="label" color={colors.text.secondary}>
              Informasi (Read-only)
            </AppText>
            <Divider marginVertical={spacing[2]} />
            <View style={styles.infoRow}>
              <AppText variant="bodySm" color={colors.text.secondary}>
                Subdomain
              </AppText>
              <AppText variant="bodyMd" style={styles.infoValue}>
                {organization?.subdomain ?? '-'}
              </AppText>
            </View>
            <Divider marginVertical={spacing[2]} />
            <View style={styles.infoRow}>
              <AppText variant="bodySm" color={colors.text.secondary}>
                Plan
              </AppText>
              <AppText variant="bodyMd" style={styles.infoValue}>
                {organization?.subscriptionPlan ?? '-'}
              </AppText>
            </View>
          </Card>

          {/* Editable fields */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Organisasi"
                  placeholder="Masukkan nama organisasi"
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
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
  infoCard: { marginBottom: spacing[5] },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoValue: { fontWeight: fontWeight.medium },
  form: { gap: spacing[4], marginBottom: spacing[6] },
  cancelButton: { marginTop: spacing[2] },
});
