import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, roleVariant } from '@presentation/components/Badge';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { Divider } from '@presentation/components/Divider';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useMembersQuery } from '@hooks/members/useMembersQuery';
import { useDeleteMemberMutation } from '@hooks/members/useDeleteMemberMutation';
import { useAppSelector } from '@store/hooks';
import type { Member, OrgRole } from '@core/domain/entities/Member';
import type { MembersStackParamList } from '@app/navigation/MembersNavigator';

type Props = NativeStackScreenProps<MembersStackParamList, 'MemberList'>;

const ROLE_OPTIONS: Array<{ label: string; value: OrgRole | undefined }> = [
  { label: 'Semua', value: undefined },
  { label: 'Owner', value: 'OWNER' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
];

interface MemberCardProps {
  member: Member;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, canManage, onEdit, onDelete }) => (
  <Card style={styles.memberCard}>
    <View style={styles.memberCardHeader}>
      <View style={styles.memberInfo}>
        <AppText variant="bodyMd" style={styles.memberName}>
          {member.fullName}
        </AppText>
        <AppText variant="bodySm" color={colors.text.secondary}>
          {member.email}
        </AppText>
      </View>
      <Badge label={member.role} variant={roleVariant(member.role)} />
    </View>

    {member.divisionName ? (
      <>
        <Divider marginVertical={spacing[2]} />
        <AppText variant="bodySm" color={colors.text.secondary}>
          Divisi: {member.divisionName}
        </AppText>
      </>
    ) : null}

    {canManage && member.role !== 'OWNER' ? (
      <>
        <Divider marginVertical={spacing[2]} />
        <View style={styles.memberActions}>
          <Button
            label="Edit Peran"
            variant="secondary"
            size="sm"
            onPress={onEdit}
            style={styles.actionButton}
          />
          <Button
            label="Hapus"
            variant="danger"
            size="sm"
            onPress={onDelete}
            style={styles.actionButton}
          />
        </View>
      </>
    ) : null}
  </Card>
);

export const MemberListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [activeRole, setActiveRole] = useState<OrgRole | undefined>(undefined);

  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useMembersQuery({
    search: search.trim() || undefined,
    role: activeRole,
    limit: 50,
  });

  const { mutate: deleteMember } = useDeleteMemberMutation();

  const handleInvite = useCallback(() => {
    navigation.navigate('InviteMember');
  }, [navigation]);

  const handleEdit = useCallback(
    (member: Member) => {
      navigation.navigate('EditMember', { memberId: member.id });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (member: Member) => {
      Alert.alert(
        'Hapus Anggota',
        `Apakah Anda yakin ingin menghapus ${member.fullName} dari organisasi?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => deleteMember(member.id),
          },
        ],
      );
    },
    [deleteMember],
  );

  const renderMember = useCallback(
    ({ item }: { item: Member }) => (
      <MemberCard
        member={item}
        canManage={canManage}
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [canManage, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: Member) => item.id, []);

  return (
    <Screen padded>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h3">Anggota</AppText>
        {canManage ? (
          <Button label="+ Undang" variant="primary" size="sm" onPress={handleInvite} />
        ) : null}
      </View>

      {/* Search */}
      <Input
        placeholder="Cari anggota..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* Role filter */}
      <View style={styles.filterRow}>
        {ROLE_OPTIONS.map(opt => (
          <TouchableOpacity
            key={String(opt.value)}
            onPress={() => setActiveRole(opt.value)}
            style={[styles.filterChip, activeRole === opt.value && styles.filterChipActive]}
            activeOpacity={0.7}
          >
            <AppText
              variant="bodySm"
              color={activeRole === opt.value ? colors.text.inverse : colors.text.secondary}
            >
              {opt.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Total */}
      {!isLoading && !isError && data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.total} anggota
        </AppText>
      ) : null}

      {/* List */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : isError ? (
        <View style={styles.centered}>
          <AppText variant="bodySm" color={colors.danger.main}>
            Gagal memuat anggota.
          </AppText>
          <Button
            label="Coba Lagi"
            variant="ghost"
            size="sm"
            onPress={() => void refetch()}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlatList
          data={data?.members ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => void refetch()}
              tintColor={colors.primary[500]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="👥"
              title="Belum ada anggota"
              description="Undang anggota pertama untuk bergabung ke organisasi."
              actionLabel={canManage ? '+ Undang Anggota' : undefined}
              onAction={canManage ? handleInvite : undefined}
            />
          }
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  searchInput: {
    marginBottom: spacing[3],
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  totalText: {
    marginBottom: spacing[3],
  },
  listContent: {
    gap: spacing[3],
    paddingBottom: spacing[6],
  },
  memberCard: {
    gap: spacing[1],
  },
  memberCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  memberInfo: {
    flex: 1,
    gap: spacing[1],
  },
  memberName: {
    fontWeight: fontWeight.semiBold,
  },
  memberActions: {
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 80,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  retryButton: {
    marginTop: spacing[2],
  },
});
