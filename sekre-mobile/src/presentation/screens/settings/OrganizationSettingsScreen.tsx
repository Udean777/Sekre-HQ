import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { organizationSchema, type OrganizationFormValues } from '@shared/utils/settingsSchemas';
import { useUpdateOrganizationMutation } from '@hooks/auth/useUpdateOrganizationMutation';
import { useAppSelector } from '@store/hooks';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { SettingsStackParamList } from '@app/navigation/SettingsNavigator';

type Props = NativeStackScreenProps<SettingsStackParamList, 'OrganizationSettings'>;

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <AppText variant="bodySm" color={colors.text.secondary}>
      {label}
    </AppText>
    <AppText variant="bodyMd" style={styles.infoValue}>
      {value}
    </AppText>
  </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

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
        onSuccess: () => setSuccess(true),
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
              <Ionicons name="business-outline" size={28} color={colors.primary[500]} />
            </View>
            <AppText variant="h3">Pengaturan Organisasi</AppText>
            <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
              Kelola informasi organisasi Anda
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
                Organisasi berhasil diperbarui.
              </AppText>
            </View>
          ) : null}

          {/* ── Read-only info ── */}
          <AppText variant="label" color={colors.text.secondary} style={styles.sectionLabel}>
            INFORMASI
          </AppText>
          <Card style={styles.infoCard}>
            <InfoRow label="Subdomain" value={organization?.subdomain ?? '-'} />
            <View style={styles.infoDivider} />
            <InfoRow label="Plan" value={organization?.subscriptionPlan ?? '-'} />
          </Card>

          {/* ── Editable fields ── */}
          <AppText variant="label" color={colors.text.secondary} style={styles.sectionLabel}>
            DAPAT DIUBAH
          </AppText>
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Organisasi"
                  placeholder="Masukkan nama organisasi"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />
          </View>

          {/* ── Actions ── */}
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

  // Section label
  sectionLabel: {
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },

  // Info card
  infoCard: {
    marginBottom: spacing[5],
    paddingVertical: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  infoValue: {
    fontWeight: fontWeight.medium,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing[3],
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing[4],
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
