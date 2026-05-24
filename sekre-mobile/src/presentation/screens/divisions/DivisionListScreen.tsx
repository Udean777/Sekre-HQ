import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { useDeleteDivisionMutation } from '@hooks/divisions/useDeleteDivisionMutation';
import { useAppSelector } from '@store/hooks';
import { useDebouncedValue } from '@hooks/ui/useDebouncedValue';
import type { Division } from '@core/domain/entities/Division';
import type { DivisionsStackParamList } from '@app/navigation/DivisionsNavigator';

type Props = NativeStackScreenProps<DivisionsStackParamList, 'DivisionList'>;

// ─── Division Card (memoized) ─────────────────────────────────────────────────

interface DivisionCardProps {
  division: Division;
  canManage: boolean;
  onPress: (division: Division) => void;
  onEdit: (division: Division) => void;
  onDelete: (division: Division) => void;
}

const DivisionCard: React.FC<DivisionCardProps> = React.memo(
  ({ division, canManage, onPress, onEdit, onDelete }) => {
    const handlePress = useCallback((): void => onPress(division), [onPress, division]);
    const handleEdit = useCallback(
      (e: { stopPropagation: () => void }): void => {
        e.stopPropagation();
        onEdit(division);
      },
      [onEdit, division],
    );
    const handleDelete = useCallback(
      (e: { stopPropagation: () => void }): void => {
        e.stopPropagation();
        onDelete(division);
      },
      [onDelete, division],
    );

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Card style={styles.divisionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.divisionIcon}>
              <Ionicons name="git-branch-outline" size={20} color={colors.primary[500]} />
            </View>

            <View style={styles.cardInfo}>
              <AppText variant="bodyMd" style={styles.divisionName} numberOfLines={1}>
                {division.name}
              </AppText>
              <AppText variant="bodySm" color={colors.text.secondary}>
                {division.memberCount > 0
                  ? `${division.memberCount} anggota`
                  : 'Belum ada anggota'}
              </AppText>
            </View>

            {canManage ? (
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={handleEdit}
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger.main} />
                </TouchableOpacity>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  },
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const DivisionListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 300);

  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useDivisionsQuery({
    search: debouncedSearch.trim() || undefined,
    pageSize: 20,
  });

  const { mutate: deleteDivision } = useDeleteDivisionMutation();

  const handlePress = useCallback(
    (division: Division): void => {
      navigation.navigate('DivisionDetail', { divisionId: division.id });
    },
    [navigation],
  );

  const handleCreate = useCallback((): void => {
    navigation.navigate('CreateDivision');
  }, [navigation]);

  const handleEdit = useCallback(
    (division: Division): void => {
      navigation.navigate('EditDivision', { divisionId: division.id });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (division: Division): void => {
      Alert.alert(
        'Hapus Divisi',
        `Apakah Anda yakin ingin menghapus divisi "${division.name}"?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: (): void => deleteDivision(division.id),
          },
        ],
      );
    },
    [deleteDivision],
  );

  const handleRefetch = useCallback((): void => { refetch(); }, [refetch]);

  const renderDivision = useCallback<ListRenderItem<Division>>(
    ({ item }) => (
      <DivisionCard
        division={item}
        canManage={canManage}
        onPress={handlePress}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [canManage, handlePress, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: Division): string => item.id, []);

  return (
    <Screen mode="none" edges={[]}>
      {/* ── Header + Search (non-scrollable, di atas list) ── */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <AppText variant="h3">Divisi</AppText>
          {canManage ? (
            <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
          ) : null}
        </View>

        <Input
          placeholder="Cari divisi..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        {!isLoading && !isError && data ? (
          <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
            {data.meta.total} divisi ditemukan
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
            Gagal memuat divisi.
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
          data={data?.items}
          keyExtractor={keyExtractor}
          renderItem={renderDivision}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefetch}
          refreshing={isFetching && !isLoading}
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title="Belum ada divisi"
              description="Buat divisi untuk mengorganisir anggota tim."
              actionLabel={canManage ? '+ Buat Divisi' : undefined}
              onAction={canManage ? handleCreate : undefined}
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
  divisionCard: {
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  divisionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: spacing[1],
  },
  divisionName: {
    fontWeight: fontWeight.semiBold,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  iconButton: {
    padding: spacing[1],
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
