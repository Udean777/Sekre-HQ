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
import { useTransactionsQuery } from '@hooks/finance/useTransactionsQuery';
import { useFinanceSummaryQuery } from '@hooks/finance/useFinanceSummaryQuery';
import { useDeleteTransactionMutation } from '@hooks/finance/useDeleteTransactionMutation';
import { useAppSelector } from '@store/hooks';
import { selectAuthRole } from '@store/slices/authSlice';
import { useDebouncedValue } from '@hooks/ui/useDebouncedValue';
import { flattenPages, lastPageMeta } from '@shared/utils/infiniteQueryHelpers';
import type { Transaction, TransactionType } from '@core/domain/entities/Transaction';
import type { FinanceStackParamList } from '@app/navigation/FinanceNavigator';
import { SummaryCard, TransactionCard } from './components';

type Props = NativeStackScreenProps<FinanceStackParamList, 'FinanceList'>;

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_FILTERS: ReadonlyArray<{ label: string; value: TransactionType | undefined }> = [
  { label: 'Semua', value: undefined },
  { label: 'Pemasukan', value: 'INCOME' },
  { label: 'Pengeluaran', value: 'EXPENSE' },
] as const;

// ─── Screen ──────────────────────────────────────────────────────────────────

export const FinanceScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(undefined);

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
  } = useTransactionsQuery({
    search: debouncedSearch.trim() || undefined,
    type: typeFilter,
    pageSize: 20,
  });

  const transactions = flattenPages(data);
  const meta = lastPageMeta(data);

  const { data: summary } = useFinanceSummaryQuery();
  const { mutate: deleteTransaction } = useDeleteTransactionMutation();

  const handlePress = useCallback(
    (tx: Transaction): void => navigation.navigate('TransactionDetail', { transactionId: tx.id }),
    [navigation],
  );

  const handleCreate = useCallback(
    (): void => navigation.navigate('CreateTransaction'),
    [navigation],
  );

  const handleDelete = useCallback(
    (tx: Transaction): void => {
      Alert.alert('Hapus Transaksi', `Hapus transaksi "${tx.description}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: (): void => deleteTransaction(tx.id) },
      ]);
    },
    [deleteTransaction],
  );

  const handleRefetch = useCallback((): void => {
    refetch();
  }, [refetch]);

  const renderItem = useCallback<ListRenderItem<Transaction>>(
    ({ item }) => (
      <TransactionCard
        transaction={item}
        canManage={canManage}
        onPress={handlePress}
        onDelete={handleDelete}
      />
    ),
    [canManage, handlePress, handleDelete],
  );

  const keyExtractor = useCallback((item: Transaction): string => item.id, []);

  return (
    <Screen mode="none" edges={['top']} tabScreen>
      {/* ── Header + Summary + Search + Filter ── */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <AppText variant="h3">Keuangan</AppText>
          {canManage ? (
            <Button label="+ Tambah" variant="primary" size="sm" onPress={handleCreate} />
          ) : null}
        </View>

        {summary ? (
          <View style={styles.summaryRow}>
            <SummaryCard
              label="Pemasukan"
              icon="arrow-down-outline"
              money={summary.totalIncome}
              color={colors.success.main}
            />
            <SummaryCard
              label="Pengeluaran"
              icon="arrow-up-outline"
              money={summary.totalExpense}
              color={colors.danger.main}
            />
            <SummaryCard
              label="Saldo"
              icon="wallet-outline"
              money={summary.balance}
              color={colors.primary[500]}
            />
          </View>
        ) : null}

        <Input
          placeholder="Cari transaksi..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <FilterChips
          options={TYPE_FILTERS}
          value={typeFilter}
          onChange={setTypeFilter}
          style={styles.filterRow}
        />

        {!isLoading && !isError && meta ? (
          <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
            {meta.total} transaksi ditemukan
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
            Gagal memuat transaksi.
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
          data={transactions}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={
            hasNextPage
              ? (): void => {
                  void fetchNextPage();
                }
              : undefined
          }
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <SkeletonList count={2} /> : null}
          onRefresh={handleRefetch}
          refreshing={isFetching && !isLoading}
          ListEmptyComponent={
            <EmptyState
              icon="wallet-outline"
              title="Belum ada transaksi"
              description="Catat transaksi pertama untuk mulai melacak keuangan."
              actionLabel={canManage ? '+ Tambah Transaksi' : undefined}
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  searchInput: {
    marginBottom: spacing[2],
  },
  filterRow: {
    marginVertical: spacing[3],
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
