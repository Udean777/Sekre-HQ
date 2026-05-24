import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { FilterChips } from '@presentation/components/FilterChips';
import { colors, spacing } from '@presentation/theme';
import { useMembersQuery } from '@hooks/members/useMembersQuery';
import { useDeleteMemberMutation } from '@hooks/members/useDeleteMemberMutation';
import { useAppSelector } from '@store/hooks';
import { selectAuthRole } from '@store/slices/authSlice';
import { useDebouncedValue } from '@hooks/ui/useDebouncedValue';
import { flattenPages, lastPageMeta } from '@shared/utils/infiniteQueryHelpers';
import type { Member, OrgRole } from '@core/domain/entities/Member';
import type { MembersStackParamList } from '@app/navigation/MembersNavigator';
import { MemberCard } from './components';

type Props = NativeStackScreenProps<MembersStackParamList, 'MemberList'>;

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_FILTERS: ReadonlyArray<{ label: string; value: OrgRole | undefined }> = [
  { label: 'Semua', value: undefined },
  { label: 'Owner', value: 'OWNER' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
] as const;

// ─── Screen ──────────────────────────────────────────────────────────────────

export const MemberListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [activeRole, setActiveRole] = useState<OrgRole | undefined>(undefined);

  const debouncedSearch = useDebouncedValue(search, 300);

  const role = useAppSelector(selectAuthRole);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMembersQuery({
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

  const handleRefetch = useCallback((): void => {
    refetch();
  }, [refetch]);

  const renderMember = useCallback<ListRenderItem<Member>>(
    ({ item }) => (
      <MemberCard member={item} canManage={canManage} onEdit={handleEdit} onDelete={handleDelete} />
    ),
    [canManage, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: Member): string => item.id, []);

  return (
    <Screen mode="none" edges={[]}>
      {/* ── Header + Search + Filter ── */}
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

        <FilterChips
          options={ROLE_FILTERS}
          value={activeRole}
          onChange={setActiveRole}
          style={styles.filterRow}
        />

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
          onEndReached={
            hasNextPage
              ? (): void => {
                  void fetchNextPage();
                }
              : undefined
          }
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
    marginVertical: spacing[2],
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
