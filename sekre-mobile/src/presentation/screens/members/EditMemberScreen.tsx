import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Button } from '@presentation/components/Button';
import { colors, spacing } from '@presentation/theme';
import { useUpdateMemberMutation } from '@hooks/members/useUpdateMemberMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { MembersStackParamList } from '@app/navigation/MembersNavigator';
import type { OrgRole } from '@core/domain/entities/Member';

type Props = NativeStackScreenProps<MembersStackParamList, 'EditMember'>;

const editMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER'], {
    error: 'Peran wajib dipilih.',
  }),
});

type EditMemberFormValues = z.infer<typeof editMemberSchema>;

const ROLE_OPTIONS: Array<{ label: string; value: OrgRole; description: string }> = [
  { label: 'Admin', value: 'ADMIN', description: 'Dapat mengelola anggota dan konten' },
  { label: 'Member', value: 'MEMBER', description: 'Akses standar ke konten organisasi' },
];

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
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="h3" style={styles.title}>
          Edit Peran Anggota
        </AppText>

        {globalError ? (
          <View style={styles.errorBanner}>
            <AppText variant="bodySm" color={colors.danger.main}>
              {globalError}
            </AppText>
          </View>
        ) : null}

        <View style={styles.form}>
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <View>
                <AppText variant="label" style={styles.fieldLabel}>
                  Peran
                </AppText>
                <View style={styles.roleOptions}>
                  {ROLE_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => onChange(opt.value)}
                      style={[styles.roleCard, value === opt.value && styles.roleCardActive]}
                      activeOpacity={0.7}
                    >
                      <AppText
                        variant="bodyMd"
                        style={
                          value === opt.value
                            ? [styles.roleLabel, styles.roleLabelActive]
                            : styles.roleLabel
                        }
                      >
                        {opt.label}
                      </AppText>
                      <AppText
                        variant="bodySm"
                        color={value === opt.value ? colors.primary[300] : colors.text.secondary}
                      >
                        {opt.description}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.role ? (
                  <AppText variant="bodySm" color={colors.danger.main}>
                    {errors.role.message}
                  </AppText>
                ) : null}
              </View>
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  title: {
    marginBottom: spacing[5],
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
  fieldLabel: {
    marginBottom: spacing[2],
    color: colors.text.primary,
  },
  roleOptions: {
    gap: spacing[2],
  },
  roleCard: {
    padding: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
    gap: spacing[1],
  },
  roleCardActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  roleLabel: {
    fontWeight: '600',
  },
  roleLabelActive: {
    color: colors.primary[700],
  },
  cancelButton: {
    marginTop: spacing[2],
  },
});
