import React, { useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, type BadgeVariant } from '@presentation/components/Badge';
import { colors, spacing, fontWeight, fontSize } from '@presentation/theme';
import { useAppSelector } from '@store/hooks';
import { useLogoutMutation } from '@hooks/auth/useLogoutMutation';
import type { SettingsStackParamList } from '@app/navigation/SettingsNavigator';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsHome'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_VARIANT: Record<string, BadgeVariant> = {
  FREE: 'default',
  LITE: 'info',
  PRO: 'primary',
};

// ─── Menu Row ─────────────────────────────────────────────────────────────────

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

const MenuRow: React.FC<MenuRowProps> = ({ icon, label, onPress, destructive = false }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.menuRow}>
    <View style={[styles.menuIcon, destructive && styles.menuIconDestructive]}>
      <Ionicons
        name={icon}
        size={18}
        color={destructive ? colors.danger.main : colors.primary[500]}
      />
    </View>
    <AppText
      variant="bodyMd"
      style={styles.menuLabel}
      color={destructive ? colors.danger.main : colors.text.primary}
    >
      {label}
    </AppText>
    {!destructive ? (
      <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
    ) : null}
  </TouchableOpacity>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <AppText variant="bodySm" color={colors.text.secondary}>
      {label}
    </AppText>
    <AppText variant="bodyMd" style={styles.infoValue} numberOfLines={1}>
      {value}
    </AppText>
  </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAppSelector(state => state.auth.user);
  const organization = useAppSelector(state => state.auth.organization);
  const role = useAppSelector(state => state.auth.role);

  const { mutate: logout, isPending } = useLogoutMutation();
  const canManageOrg = role === 'OWNER' || role === 'ADMIN';
  const plan = organization?.subscriptionPlan ?? 'FREE';

  const handleLogout = useCallback((): void => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: (): void => logout() },
    ]);
  }, [logout]);

  return (
    <Screen scrollable padded edges={['top']} tabScreen>
      {/* ── Profile card ── */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>
            {user?.fullName
              .split(' ')
              .slice(0, 2)
              .map(w => w[0]?.toUpperCase() ?? '')
              .join('') ?? '?'}
          </AppText>
        </View>
        <View style={styles.profileInfo}>
          <AppText variant="h4" style={styles.profileName}>
            {user?.fullName ?? '-'}
          </AppText>
          <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
            {user?.email ?? '-'}
          </AppText>
          <View style={styles.profileMeta}>
            <Badge label={role ?? '-'} variant="default" />
            <Badge label={plan} variant={PLAN_VARIANT[plan] ?? 'default'} />
          </View>
        </View>
      </View>

      {/* ── Akun ── */}
      <AppText variant="label" color={colors.text.secondary} style={styles.sectionLabel}>
        AKUN
      </AppText>
      <Card style={styles.menuCard}>
        <MenuRow
          icon="person-outline"
          label="Edit Profil"
          onPress={() => navigation.navigate('UpdateProfile')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="lock-closed-outline"
          label="Ganti Password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </Card>

      {/* ── Organisasi ── */}
      <AppText variant="label" color={colors.text.secondary} style={styles.sectionLabel}>
        ORGANISASI
      </AppText>
      <Card style={styles.infoCard}>
        <InfoRow label="Nama" value={organization?.name ?? '-'} />
        <View style={styles.menuDivider} />
        <InfoRow label="Subdomain" value={organization?.subdomain ?? '-'} />
        <View style={styles.menuDivider} />
        <InfoRow label="Plan" value={plan} />
        {canManageOrg ? (
          <>
            <View style={styles.menuDivider} />
            <MenuRow
              icon="settings-outline"
              label="Edit Organisasi"
              onPress={() => navigation.navigate('OrganizationSettings')}
            />
          </>
        ) : null}
      </Card>

      {/* ── Lainnya ── */}
      <AppText variant="label" color={colors.text.secondary} style={styles.sectionLabel}>
        LAINNYA
      </AppText>
      <Card style={styles.menuCard}>
        <MenuRow icon="log-out-outline" label="Keluar" onPress={handleLogout} destructive />
      </Card>

      {isPending ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.loggingOut}>
          Sedang keluar...
        </AppText>
      ) : null}
    </Screen>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: colors.surface.card,
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[5],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  profileInfo: {
    flex: 1,
    gap: spacing[1],
  },
  profileName: {
    fontWeight: fontWeight.bold,
  },
  profileMeta: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[1],
  },

  // Section label
  sectionLabel: {
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },

  // Menu card
  menuCard: {
    marginBottom: spacing[4],
    paddingVertical: 0,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDestructive: {
    backgroundColor: colors.danger.light,
  },
  menuLabel: {
    flex: 1,
    fontWeight: fontWeight.medium,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing[4],
  },

  // Info card
  infoCard: {
    marginBottom: spacing[4],
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

  loggingOut: {
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
