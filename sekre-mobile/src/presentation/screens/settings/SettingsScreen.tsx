import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing } from '@presentation/theme';
import { useAppSelector } from '@store/hooks';
import { useLogoutMutation } from '@hooks/auth/useLogoutMutation';

export const SettingsScreen: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);
  const organization = useAppSelector(state => state.auth.organization);
  const role = useAppSelector(state => state.auth.role);

  const { mutate: logout, isPending } = useLogoutMutation();

  const handleLogout = (): void => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <Screen scrollable padded>
      <AppText variant="h3" style={styles.title}>
        Pengaturan
      </AppText>

      {/* Profile info */}
      <Card style={styles.card}>
        <AppText variant="label" color={colors.text.secondary}>
          Akun
        </AppText>
        <Divider marginVertical={spacing[2]} />
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Nama
          </AppText>
          <AppText variant="bodyMd">{user?.fullName ?? '-'}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Email
          </AppText>
          <AppText variant="bodyMd">{user?.email ?? '-'}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Peran
          </AppText>
          <AppText variant="bodyMd">{role ?? '-'}</AppText>
        </View>
      </Card>

      {/* Organization info */}
      <Card style={styles.card}>
        <AppText variant="label" color={colors.text.secondary}>
          Organisasi
        </AppText>
        <Divider marginVertical={spacing[2]} />
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Nama
          </AppText>
          <AppText variant="bodyMd">{organization?.name ?? '-'}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Subdomain
          </AppText>
          <AppText variant="bodyMd">{organization?.subdomain ?? '-'}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Plan
          </AppText>
          <AppText variant="bodyMd">{organization?.subscriptionPlan ?? '-'}</AppText>
        </View>
      </Card>

      {/* Logout */}
      <Button
        label="Keluar"
        variant="danger"
        size="lg"
        fullWidth
        loading={isPending}
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing[4],
  },
  card: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  logoutButton: {
    marginTop: spacing[4],
  },
});
