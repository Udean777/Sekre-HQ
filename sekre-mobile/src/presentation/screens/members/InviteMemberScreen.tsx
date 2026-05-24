import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SelectField } from '@presentation/components/SelectField';
import type { SelectOption } from '@presentation/components/SelectField';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { inviteMemberSchema, type InviteMemberFormValues } from '@shared/utils/memberSchemas';
import { useCreateMemberMutation } from '@hooks/members/useCreateMemberMutation';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { flattenPages } from '@shared/utils/infiniteQueryHelpers';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { MembersStackParamList } from '@app/navigation/MembersNavigator';
import type { OrgRole } from '@core/domain/entities/Member';

type Props = NativeStackScreenProps<MembersStackParamList, 'InviteMember'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS: Array<{ label: string; value: OrgRole; description: string; icon: string }> = [
  {
    label: 'Admin',
    value: 'ADMIN',
    description: 'Dapat mengelola anggota dan konten',
    icon: 'shield-checkmark-outline',
  },
  {
    label: 'Member',
    value: 'MEMBER',
    description: 'Akses standar ke konten organisasi',
    icon: 'person-outline',
  },
];

const DIVISION_ROLE_OPTIONS: SelectOption[] = [
  { label: 'Ketua', value: 'HEAD' },
  { label: 'Anggota', value: 'STAFF' },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export const InviteMemberScreen: React.FC<Props> = ({ navigation }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mutate: createMember, isPending } = useCreateMemberMutation();
  const { data: divisionsData, isLoading: divisionsLoading } = useDivisionsQuery({ pageSize: 100 });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      fullName: '',
      role: 'MEMBER',
      divisionId: undefined,
      divisionRole: undefined,
    },
  });

  const selectedDivisionId = watch('divisionId');

  const divisionOptions: SelectOption[] = flattenPages(divisionsData).map(d => ({
    label: d.name,
    value: d.id,
  }));

  const onSubmit = (values: InviteMemberFormValues): void => {
    setGlobalError(null);
    createMember(
      {
        email: values.email,
        fullName: values.fullName,
        role: values.role,
        ...(values.divisionId ? { divisionId: values.divisionId } : {}),
        ...(values.divisionId && values.divisionRole ? { divisionRole: values.divisionRole } : {}),
      },
      {
        onSuccess: () => navigation.goBack(),
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
              <Ionicons name="person-add-outline" size={28} color={colors.primary[500]} />
            </View>
            <AppText variant="h3">Undang Anggota</AppText>
            <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
              Tambahkan anggota baru ke organisasi Anda
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

            {/* Info Akun */}
            <AppText variant="label" color={colors.text.secondary} style={styles.sectionLabel}>
              INFO AKUN
            </AppText>

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Lengkap"
                  placeholder="Nama lengkap anggota"
                  autoCapitalize="words"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                />
              )}
            />

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

            {/* Peran Organisasi */}
            <AppText variant="label" color={colors.text.secondary} style={styles.sectionLabel}>
              PERAN ORGANISASI
            </AppText>

            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <View>
                  <View style={styles.roleOptions}>
                    {ROLE_OPTIONS.map(opt => {
                      const active = value === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => onChange(opt.value)}
                          style={[styles.roleCard, active && styles.roleCardActive]}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.roleIconBox, active && styles.roleIconBoxActive]}>
                            <Ionicons
                              name={opt.icon}
                              size={20}
                              color={active ? colors.primary[600] : colors.text.secondary}
                            />
                          </View>
                          <View style={styles.roleText}>
                            <AppText
                              variant="bodyMd"
                              style={styles.roleLabel}
                              color={active ? colors.primary[700] : colors.text.primary}
                            >
                              {opt.label}
                            </AppText>
                            <AppText
                              variant="bodySm"
                              color={active ? colors.primary[500] : colors.text.secondary}
                            >
                              {opt.description}
                            </AppText>
                          </View>
                          {active ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={colors.primary[500]}
                            />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {errors.role ? (
                    <AppText variant="bodySm" color={colors.danger.main} style={styles.fieldError}>
                      {errors.role.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />

            {/* Divisi (opsional) */}
            <AppText variant="label" color={colors.text.secondary} style={styles.sectionLabel}>
              DIVISI (OPSIONAL)
            </AppText>

            <Controller
              control={control}
              name="divisionId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Divisi"
                  placeholder="Pilih divisi (opsional)"
                  options={divisionOptions}
                  value={value ?? ''}
                  onChange={onChange}
                  loading={divisionsLoading}
                  error={errors.divisionId?.message}
                />
              )}
            />

            {selectedDivisionId ? (
              <Controller
                control={control}
                name="divisionRole"
                render={({ field: { onChange, value } }) => (
                  <SelectField
                    label="Peran di Divisi"
                    placeholder="Pilih peran di divisi"
                    options={DIVISION_ROLE_OPTIONS}
                    value={value ?? ''}
                    onChange={onChange}
                    error={errors.divisionRole?.message}
                  />
                )}
              />
            ) : null}
          </View>

          {/* ── Actions ── */}
          <Button
            label="Kirim Undangan"
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
  sectionLabel: {
    marginTop: spacing[2],
    marginBottom: spacing[1],
    letterSpacing: 0.5,
  },
  fieldError: {
    marginTop: spacing[1],
  },

  // Role selector
  roleOptions: {
    gap: spacing[2],
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  roleCardActive: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  roleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconBoxActive: {
    backgroundColor: colors.primary[100],
  },
  roleText: {
    flex: 1,
    gap: spacing[1],
  },
  roleLabel: {
    fontWeight: fontWeight.semiBold,
  },

  // Actions
  cancelButton: {
    marginTop: spacing[2],
  },
});
