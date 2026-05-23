import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, type BadgeVariant } from '@presentation/components/Badge';
import { Button } from '@presentation/components/Button';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing, fontWeight, fontSize } from '@presentation/theme';
import { useDivisionQuery } from '@hooks/divisions/useDivisionQuery';
import { useRemoveDivisionMemberMutation } from '@hooks/divisions/useRemoveDivisionMemberMutation';
import { useAppSelector } from '@store/hooks';
import type { DivisionMember, DivisionRole } from '@core/domain/entities/Division';
import type { DivisionsStackParamList } from '@app/navigation/DivisionsNavigator';

type Props = NativeStackScreenProps<DivisionsStackParamList, 'DivisionDetail'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_VARIANT: Record<DivisionRole, BadgeVariant> = {
  HEAD: 'primary',
  STAFF: 'default',
};

const ROLE_LABEL: Record<DivisionRole, string> = {
  HEAD: 'Ketua',
  STAFF: 'Staf',
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={styles.avatar}>
      <AppText style={styles.avatarText}>{initials}</AppText>
    </View>
  );
};

// ─── Member Row ───────────────────────────────────────────────────────────────

interface MemberRowProps {
  member: DivisionMember;
  canManage: boolean;
  onRemove: () => void;
}

const MemberRow: React.FC<MemberRowProps> = ({ member, canManage, onRemove }) => (
  <View style={styles.memberRow}>
    <Avatar name={member.fullName} />
    <View style={styles.memberInfo}>
      <AppText variant="bodyMd" style={styles.memberName} numberOfLines={1}>
        {member.fullName}
      </AppText>
      <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
        {member.email}
      </AppText>
    </View>
    <View style={styles.memberRight}>
      <Badge label={ROLE_LABEL[member.role]} variant={ROLE_VARIANT[member.role]} />
      {canManage ? (
        <TouchableOpacity
          onPress={onRemove}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger.main} />
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

export const DivisionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { divisionId } = route.params;
  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data: division, isLoading, isError } = useDivisionQuery(divisionId);
  const { mutate: removeMember } = useRemoveDivisionMemberMutation();

  const handleEdit = useCallback(() => {
    navigation.navigate('EditDivision', { divisionId });
  }, [navigation, divisionId]);

  const handleRemoveMember = useCallback(
    (member: DivisionMember) => {
      Alert.alert('Hapus Anggota', `Hapus ${member.fullName} dari divisi ini?`, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: (): void => removeMember({ id: divisionId, userId: member.userId }),
        },
      ]);
    },
    [divisionId, removeMember],
  );

  // ── Loading ──
  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

  // ── Error ──
  if (isError || !division) {
    return (
      <Screen padded>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger.main} />
          <AppText variant="bodyMd" color={colors.danger.main} style={styles.errorText}>
            Gagal memuat detail divisi.
          </AppText>
          <Button
            label="Kembali"
            variant="ghost"
            size="sm"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </Screen>
    );
  }

  const memberCount = division.members.length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}>
            <Ionicons name="git-branch-outline" size={24} color={colors.primary[500]} />
          </View>
          <View style={styles.titleInfo}>
            <AppText variant="h3" style={styles.title}>
              {division.name}
            </AppText>
            <AppText variant="bodySm" color={colors.text.secondary}>
              {memberCount} anggota
            </AppText>
          </View>
          {canManage ? (
            <Button label="Edit" variant="secondary" size="sm" onPress={handleEdit} />
          ) : null}
        </View>

        {/* ── Stats ── */}
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={18} color={colors.primary[500]} />
              <View>
                <AppText variant="bodySm" color={colors.text.secondary}>
                  Total Anggota
                </AppText>
                <AppText variant="bodyMd" style={styles.statValue}>
                  {memberCount}
                </AppText>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary[500]} />
              <View>
                <AppText variant="bodySm" color={colors.text.secondary}>
                  Dibuat
                </AppText>
                <AppText variant="bodyMd" style={styles.statValue}>
                  {division.createdAt.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </AppText>
              </View>
            </View>
          </View>
        </Card>

        {/* ── Members ── */}
        <View style={styles.sectionHeader}>
          <AppText variant="h4">Anggota Divisi</AppText>
          <AppText variant="bodySm" color={colors.text.secondary}>
            {memberCount} orang
          </AppText>
        </View>

        {memberCount === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="people-outline" size={32} color={colors.text.disabled} />
            <AppText variant="bodySm" color={colors.text.secondary} style={styles.emptyText}>
              Belum ada anggota di divisi ini.
            </AppText>
          </Card>
        ) : (
          <Card style={styles.membersCard}>
            {division.members.map((member, index) => (
              <View key={member.userId}>
                {index > 0 ? <Divider marginVertical={0} /> : null}
                <MemberRow
                  member={member}
                  canManage={canManage}
                  onRemove={() => handleRemoveMember(member)}
                />
              </View>
            ))}
          </Card>
        )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[6],
  },
  errorText: {
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing[1],
  },

  // Header
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInfo: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    fontWeight: fontWeight.bold,
  },

  // Stats
  statsCard: {
    marginBottom: spacing[5],
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing[3],
  },
  statValue: {
    fontWeight: fontWeight.semiBold,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  // Members
  membersCard: {
    paddingVertical: 0,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  memberInfo: {
    flex: 1,
    gap: spacing[1],
  },
  memberName: {
    fontWeight: fontWeight.medium,
  },
  memberRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
  },

  // Empty
  emptyCard: {
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[6],
  },
  emptyText: {
    textAlign: 'center',
  },
});
