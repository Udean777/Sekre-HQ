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
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, type BadgeVariant } from '@presentation/components/Badge';
import { Button } from '@presentation/components/Button';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useDivisionQuery } from '@hooks/divisions/useDivisionQuery';
import { useRemoveDivisionMemberMutation } from '@hooks/divisions/useRemoveDivisionMemberMutation';
import { useAppSelector } from '@store/hooks';
import type { DivisionMember, DivisionRole } from '@core/domain/entities/Division';
import type { DivisionsStackParamList } from '@app/navigation/DivisionsNavigator';

type Props = NativeStackScreenProps<DivisionsStackParamList, 'DivisionDetail'>;

const ROLE_VARIANT: Record<DivisionRole, BadgeVariant> = {
  HEAD: 'primary',
  MEMBER: 'default',
};

const ROLE_LABEL: Record<DivisionRole, string> = {
  HEAD: 'Ketua',
  MEMBER: 'Anggota',
};

interface MemberRowProps {
  member: DivisionMember;
  canManage: boolean;
  onRemove: () => void;
}

const MemberRow: React.FC<MemberRowProps> = ({ member, canManage, onRemove }) => (
  <View style={styles.memberRow}>
    <View style={styles.memberInfo}>
      <AppText variant="bodyMd" style={styles.memberName}>
        {member.fullName}
      </AppText>
      <AppText variant="bodySm" color={colors.text.secondary}>
        {member.email}
      </AppText>
    </View>
    <View style={styles.memberRight}>
      <Badge label={ROLE_LABEL[member.role]} variant={ROLE_VARIANT[member.role]} />
      {canManage ? (
        <TouchableOpacity onPress={onRemove} activeOpacity={0.7} style={styles.removeButton}>
          <AppText variant="bodySm" color={colors.danger.main}>
            Hapus
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

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
          onPress: () => removeMember({ id: divisionId, userId: member.userId }),
        },
      ]);
    },
    [divisionId, removeMember],
  );

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

  if (isError || !division) {
    return (
      <Screen padded>
        <AppText variant="bodySm" color={colors.danger.main}>
          Gagal memuat detail divisi.
        </AppText>
        <Button
          label="Kembali"
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.titleRow}>
          <AppText variant="h3" style={styles.title}>
            {division.name}
          </AppText>
          {canManage ? (
            <Button label="Edit" variant="secondary" size="sm" onPress={handleEdit} />
          ) : null}
        </View>

        {/* Description */}
        {division.description ? (
          <AppText variant="bodyMd" color={colors.text.secondary} style={styles.description}>
            {division.description}
          </AppText>
        ) : null}

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Total Anggota
            </AppText>
            <AppText variant="bodyMd" style={styles.statValue}>
              {division.memberCount}
            </AppText>
          </View>
          <Divider marginVertical={spacing[2]} />
          <View style={styles.statRow}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Dibuat
            </AppText>
            <AppText variant="bodyMd" style={styles.statValue}>
              {division.createdAt.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </AppText>
          </View>
        </Card>

        {/* Members */}
        <AppText variant="h4" style={styles.sectionTitle}>
          Anggota Divisi
        </AppText>

        {division.members.length === 0 ? (
          <AppText variant="bodySm" color={colors.text.secondary}>
            Belum ada anggota di divisi ini.
          </AppText>
        ) : (
          <Card style={styles.membersCard}>
            {division.members.map((member, index) => (
              <View key={member.userId}>
                {index > 0 ? <Divider marginVertical={spacing[2]} /> : null}
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

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: spacing[3],
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  title: {
    flex: 1,
    fontWeight: fontWeight.bold,
  },
  description: {
    marginBottom: spacing[4],
  },
  statsCard: {
    marginBottom: spacing[5],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontWeight: fontWeight.medium,
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  membersCard: {
    gap: spacing[1],
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[2],
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
  removeButton: {
    paddingVertical: spacing[1],
  },
});
