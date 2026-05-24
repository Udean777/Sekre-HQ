import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, roleVariant } from '@presentation/components/Badge';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing, fontWeight, fontSize } from '@presentation/theme';
import { useMembersQuery } from '@hooks/members/useMembersQuery';
import { useDeleteMemberMutation } from '@hooks/members/useDeleteMemberMutation';
import { useAppSelector } from '@store/hooks';
import { useDebouncedValue } from '@hooks/ui/useDebouncedValue';
import { flattenPages, lastPageMeta } from '@shared/utils/infiniteQueryHelpers';
import type { Member, OrgRole } from '@core/domain/entities/Member';
import type { MembersStackParamList } from '@app/navigation/MembersNavigator';

type Props = NativeStackScreenProps<MembersStackParamList, 'MemberList'>;

// ─── Constants (module scope — tidak re-create tiap render) ───────────────────

const ROLE_FILTERS: ReadonlyArray<{ label: string; value: OrgRole | undefined }> = [
  { label: 'Semua', value: undefined },
  { label: 'Owner', value: 'OWNER' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
] as const;

const ROLE_LABEL: Readonly<Record<OrgRole, string>> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
} as const;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: React.FC<{ name: string }> = React.memo(({ name }) => {
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
});

// ─── Member Card (memoized) ───────────────────────────────────────────────────

interface MemberCardProps {
  member: Member;
  canManage: boolean;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const MemberCard: React.FC<MemberCardProps> = React.memo(
  ({ member, canManage, onEdit, onDelete }) => {
    const handleEdit = useCallback((): void => onEdit(member), [onEdit, member]);
    const handleDelete = useCallback((): void => onDelete(member), [onDelete, member]);

    return (
      <Card style={styles.memberCard}>
        <View style={styles.cardRow}>
          <Avatar name={member.fullName} />
          <View style={styles.memberInfo}>
            <AppText variant="bodyMd" style={styles.memberName} numberOfLines={1}>
              {member.fullName}
            </AppText>
            <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
              {member.email}
            </AppText>
          </View>
          <View style={styles.cardRight}>
            <Badge label={ROLE_LABEL[member.role]} variant={roleVariant(member.role)} />
            {canManage && member.role !== 'OWNER' ? (
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={handleEdit}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={17} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={17} color={colors.danger.main} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    );
  },
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const MemberListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [activeRole, setActiveRole] = useState<OrgRole | undefined>(undefined);

  const debouncedSearch = useDebouncedValue(search, 300);

  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } = useMembersQuery({
    search: debouncedSearch.trim() || undefined,
    role: activeRole,
    pageSize: 20,
  });

  const members = flattenPages(data);
  const meta = lastPageMeta(data);

  const { mutate: deleteMember } = useDeleteMemberMutation();

  const handleInvite = useCallback((): void => navigation.navigate('InviteMember'), [navigation]);

  const handleEdit = useCallback(
    (member: Member): void => navigation.navigate('EditMember', { memberId: member.id }),
    [navigation],
  );

  const handleDelete = useCallback(
    (member: Member): void => {
      Alert.alert('Hapus Anggota', `Hapus ${member.fullName} dari organisasi?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: (): void => deleteMember(member.id) },
      ]);
    },
    [deleteMember],
  );

  const handleRefetch = useCallback((): void => { refetch(); }, [refetch]);

  const renderMember = useCallback<ListRenderItem<Member>>(
    ({ item }) => (
      <MemberCard
        member={item}
        canManage={canManage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [canManage, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: Member): string => item.id, []);

  return (
    <Screen mode="none" edges={[]}>
      {/* ── Header + Search + Filter (non-scrollable, di atas list) ── */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <AppText variant="h3">Anggota</AppText>
          {canManage ? (
            <Button label="+ Undang" variant="primary" size="sm" onPress={handleInvite} />
          ) : null}
        </View>

        <Input
          placeholder="Cari anggota..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <View style={styles.filterRow}>
          {ROLE_FILTERS.map(opt => (
            <TouchableOpacity
              key={opt.value ?? 'all'}
              onPress={(): void => setActiveRole(opt.value)}
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

        {!isLoading && !isError && meta ? (
          <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
            {meta.total} anggota ditemukan
          </AppText>
        ) : null}
      </View>

      {/* ── List ── */}
      {isLoading ? (
        <View style={styles.skeletonWrapper}>
          <SkeletonList count={5} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger.main} />
          <AppText variant="bodySm" color={colors.danger.main} style={styles.errorText}>
            Gagal memuat anggota.
          </AppText>
          <Button
            label="Coba Lagi"
            variant="ghost"
            size="sm"
            onPress={handleRefetch}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlashList
          data={members}
          keyExtractor={keyExtractor}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefetch}
          refreshing={isFetching && !isLoading}
          onEndReached={hasNextPage ? (): void => { void fetchNextPage(); } : undefined}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <SkeletonList count={2} /> : null}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  searchInput: {
    marginBottom: spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginVertical: spacing[2],
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
    marginBottom: spacing[2],
  },
  skeletonWrapper: {
    paddingHorizontal: spacing[4],
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },

  // Card
  memberCard: {
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  memberInfo: {
    flex: 1,
    gap: spacing[1],
  },
  memberName: {
    fontWeight: fontWeight.semiBold,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },

  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
    gap: spacing[2],
  },
  errorText: {
    marginTop: spacing[1],
  },
  retryButton: {
    marginTop: spacing[1],
  },
});
