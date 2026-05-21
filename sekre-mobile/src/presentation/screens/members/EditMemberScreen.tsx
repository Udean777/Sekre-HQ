import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Button } from '@presentation/components/Button';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useUpdateMemberMutation } from '@hooks/members/useUpdateMemberMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { MembersStackParamList } from '@app/navigation/MembersNavigator';
import type { OrgRole } from '@core/domain/entities/Member';

type Props = NativeStackScreenProps<MembersStackParamList, 'EditMember'>;

// ─── Schema ───────────────────────────────────────────────────────────────────

const editMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER'], {
    error: 'Peran wajib dipilih.',
  }),
});

type EditMemberFormValues = z.infer<typeof editMemberSchema>;

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

// ─── Screen ──────────────────────────────────────────────────────────────────

export const EditMemberScreen: React.FC<Props> = ({ navigation, route }) => {
  const { memberId } = route.params;
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mutate: updateMember, isPending } = useUpdateMemberMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const onSubmit = (values: EditMemberFormValues): void => {
    setGlobalError(null);
    updateMember(
      { id: memberId, params: { role: values.role } },
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="person-outline" size={28} color={colors.primary[500]} />
          </View>
          <AppText variant="h3">Edit Peran Anggota</AppText>
          <AppText variant="bodyMd" color={colors.text.secondary} style={styles.subtitle}>
            Ubah peran anggota dalam organisasi
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

        {/* ── Role selector ── */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <View>
                <AppText variant="label" color={colors.text.secondary} style={styles.fieldLabel}>
                  Pilih Peran
                </AppText>
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
                            name={opt.icon as any}
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
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
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
    </Screen>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
    marginBottom: spacing[6],
  },
  fieldLabel: {
    marginBottom: spacing[2],
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
