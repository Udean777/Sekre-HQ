import React, { useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useAppSelector } from '@store/hooks';
import { useLogoutMutation } from '@hooks/auth/useLogoutMutation';
import type { SettingsStackParamList } from '@app/navigation/SettingsNavigator';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsHome'>;

interface MenuRowProps {
  label: string;
  onPress: () => void;
}

const MenuRow: React.FC<MenuRowProps> = ({ label, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.menuRow}>
    <AppText variant="bodyMd">{label}</AppText>
    <AppText variant="bodyMd" color={colors.text.secondary}>
      ›
    </AppText>
  </TouchableOpacity>
);

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAppSelector(state => state.auth.user);
  const organization = useAppSelector(state => state.auth.organization);
  const role = useAppSelector(state => state.auth.role);

  const { mutate: logout, isPending } = useLogoutMutation();

  const canManageOrg = role === 'OWNER' || role === 'ADMIN';

  const handleLogout = useCallback((): void => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
  }, [logout]);

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
          <AppText variant="bodyMd" style={styles.infoValue}>
            {user?.fullName ?? '-'}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Email
          </AppText>
          <AppText variant="bodyMd" style={styles.infoValue} numberOfLines={1}>
            {user?.email ?? '-'}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Peran
          </AppText>
          <AppText variant="bodyMd" style={styles.infoValue}>
            {role ?? '-'}
          </AppText>
        </View>
      </Card>

      {/* Account actions */}
      <Card style={styles.card}>
        <AppText variant="label" color={colors.text.secondary}>
          Pengaturan Akun
        </AppText>
        <Divider marginVertical={spacing[2]} />
        <MenuRow
          label="Edit Profil"
          onPress={() => navigation.navigate('UpdateProfile')}
        />
        <Divider marginVertical={spacing[1]} />
        <MenuRow
          label="Ganti Password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
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
          <AppText variant="bodyMd" style={styles.infoValue}>
            {organization?.name ?? '-'}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Subdomain
          </AppText>
          <AppText variant="bodyMd" style={styles.infoValue}>
            {organization?.subdomain ?? '-'}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Plan
          </AppText>
          <AppText variant="bodyMd" style={styles.infoValue}>
            {organization?.subscriptionPlan ?? '-'}
          </AppText>
        </View>
        {canManageOrg ? (
          <>
            <Divider marginVertical={spacing[1]} />
            <MenuRow
              label="Edit Organisasi"
              onPress={() => navigation.navigate('OrganizationSettings')}
            />
          </>
        ) : null}
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
  title: { marginBottom: spacing[4] },
  card: { marginBottom: spacing[4], gap: spacing[2] },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  infoValue: { fontWeight: fontWeight.medium, flex: 1, textAlign: 'right', marginLeft: spacing[3] },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  logoutButton: { marginTop: spacing[4] },
});
