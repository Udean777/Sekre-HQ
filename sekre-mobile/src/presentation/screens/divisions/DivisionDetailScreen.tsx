import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Button } from '@presentation/components/Button';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useDivisionQuery } from '@hooks/divisions/useDivisionQuery';
import { useRemoveDivisionMemberMutation } from '@hooks/divisions/useRemoveDivisionMemberMutation';
import { useAppSelector } from '@store/hooks';
import { selectAuthRole } from '@store/slices/authSlice';
import { formatDateShort } from '@shared/utils/formatDate';
import type { DivisionMember } from '@core/domain/entities/Division';
import type { DivisionsStackParamList } from '@app/navigation/DivisionsNavigator';
import { MemberRow } from './components';

type Props = NativeStackScreenProps<DivisionsStackParamList, 'DivisionDetail'>;

export const DivisionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { divisionId } = route.params;
  const role = useAppSelector(selectAuthRole);
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

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

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
                  {formatDateShort(division.createdAt)}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  membersCard: {
    paddingVertical: 0,
    overflow: 'hidden',
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[6],
  },
  emptyText: {
    textAlign: 'center',
  },
});
