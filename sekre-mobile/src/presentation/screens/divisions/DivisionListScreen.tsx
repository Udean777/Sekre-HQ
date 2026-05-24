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
import { colors, spacing } from '@presentation/theme';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { useDeleteDivisionMutation } from '@hooks/divisions/useDeleteDivisionMutation';
import { useAppSelector } from '@store/hooks';
import { selectAuthRole } from '@store/slices/authSlice';
import { useDebouncedValue } from '@hooks/ui/useDebouncedValue';
import { flattenPages, lastPageMeta } from '@shared/utils/infiniteQueryHelpers';
import type { Division } from '@core/domain/entities/Division';
import type { DivisionsStackParamList } from '@app/navigation/DivisionsNavigator';
import { DivisionCard } from './components';

type Props = NativeStackScreenProps<DivisionsStackParamList, 'DivisionList'>;

export const DivisionListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');

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
  } = useDivisionsQuery({
    search: debouncedSearch.trim() || undefined,
    pageSize: 20,
  });

  const divisions = flattenPages(data);
  const meta = lastPageMeta(data);

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
      Alert.alert('Hapus Divisi', `Apakah Anda yakin ingin menghapus divisi "${division.name}"?`, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: (): void => deleteDivision(division.id),
        },
      ]);
    },
    [deleteDivision],
  );

  const handleRefetch = useCallback((): void => {
    refetch();
  }, [refetch]);

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
      {/* ── Header + Search ── */}
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

        {!isLoading && !isError && meta ? (
          <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
            {meta.total} divisi ditemukan
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
          data={divisions}
          keyExtractor={keyExtractor}
          renderItem={renderDivision}
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
