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
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { colors, spacing } from '@presentation/theme';
import { inviteMemberSchema, type InviteMemberFormValues } from '@shared/utils/memberSchemas';
import { useCreateMemberMutation } from '@hooks/members/useCreateMemberMutation';
import { isDomainError } from '@core/domain/errors/DomainError';
import type { MembersStackParamList } from '@app/navigation/MembersNavigator';
import type { OrgRole } from '@core/domain/entities/Member';

type Props = NativeStackScreenProps<MembersStackParamList, 'InviteMember'>;

const ROLE_OPTIONS: Array<{ label: string; value: OrgRole; description: string }> = [
  { label: 'Admin', value: 'ADMIN', description: 'Dapat mengelola anggota dan konten' },
  { label: 'Member', value: 'MEMBER', description: 'Akses standar ke konten organisasi' },
];

export const InviteMemberScreen: React.FC<Props> = ({ navigation }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mutate: createMember, isPending } = useCreateMemberMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  const onSubmit = (values: InviteMemberFormValues): void => {
    setGlobalError(null);
    createMember(
      { email: values.email, role: values.role },
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
            Undang Anggota
          </AppText>

          {globalError ? (
            <View style={styles.errorBanner}>
              <AppText variant="bodySm" color={colors.danger.main}>
                {globalError}
              </AppText>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Email */}
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

            {/* Role */}
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

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
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
