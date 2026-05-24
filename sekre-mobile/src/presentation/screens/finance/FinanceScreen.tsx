import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { Badge, txStatusVariant } from '@presentation/components/Badge';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useTransactionsQuery } from '@hooks/finance/useTransactionsQuery';
import { useFinanceSummaryQuery } from '@hooks/finance/useFinanceSummaryQuery';
import { useDeleteTransactionMutation } from '@hooks/finance/useDeleteTransactionMutation';
import { useAppSelector } from '@store/hooks';
import type { Transaction, TransactionType, Money } from '@core/domain/entities/Transaction';
import type { FinanceStackParamList } from '@app/navigation/FinanceNavigator';

type Props = NativeStackScreenProps<FinanceStackParamList, 'FinanceList'>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatMoney = (money: Money): string => {
  const amount = money.amountCents / 100;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date): string =>
  date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PENDING: 'Menunggu',
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  icon: string;
  money: Money;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, icon, money, color }) => (
  <Card style={styles.summaryCard}>
    <View style={[styles.summaryIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <AppText variant="bodySm" color={colors.text.secondary}>
      {label}
    </AppText>
    <AppText variant="bodyMd" style={[styles.summaryAmount, { color }]}>
      {formatMoney(money)}
    </AppText>
  </Card>
);

// ─── Transaction Card ─────────────────────────────────────────────────────────

interface TransactionCardProps {
  transaction: Transaction;
  canManage: boolean;
  onPress: () => void;
  onDelete: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  canManage,
  onPress,
  onDelete,
}) => {
  const isIncome = transaction.type === 'INCOME';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.txCard}>
        <View style={styles.txHeader}>
          {/* Type icon */}
          <View
            style={[
              styles.txIcon,
              {
                backgroundColor: isIncome ? `${colors.success.main}18` : `${colors.danger.main}18`,
              },
            ]}
          >
            <Ionicons
              name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
              size={18}
              color={isIncome ? colors.success.main : colors.danger.main}
            />
          </View>

          {/* Info */}
          <View style={styles.txInfo}>
            <AppText variant="bodyMd" style={styles.txDesc} numberOfLines={1}>
              {transaction.description}
            </AppText>
            <AppText variant="bodySm" color={colors.text.secondary}>
              {formatDate(transaction.createdAt)}
            </AppText>
          </View>

          {/* Amount + actions */}
          <View style={styles.txRight}>
            <AppText
              variant="bodyMd"
              style={[
                styles.txAmount,
                { color: isIncome ? colors.success.main : colors.danger.main },
              ]}
            >
              {isIncome ? '+' : '-'}
              {formatMoney(transaction.amount)}
            </AppText>
            <View style={styles.txMeta}>
              <Badge
                label={STATUS_LABEL[transaction.status] ?? transaction.status}
                variant={txStatusVariant(transaction.status)}
              />
              {canManage ? (
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger.main} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export const FinanceScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(undefined);
  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useTransactionsQuery({
    search: search.trim() || undefined,
    type: typeFilter,
    pageSize: 20,
  });

  const { data: summary } = useFinanceSummaryQuery();
  const { mutate: deleteTransaction } = useDeleteTransactionMutation();

  const handlePress = useCallback(
    (tx: Transaction) => navigation.navigate('TransactionDetail', { transactionId: tx.id }),
    [navigation],
  );

  const handleCreate = useCallback(() => navigation.navigate('CreateTransaction'), [navigation]);

  const handleDelete = useCallback(
    (tx: Transaction) => {
      Alert.alert('Hapus Transaksi', `Hapus transaksi "${tx.description}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: (): void => deleteTransaction(tx.id) },
      ]);
    },
    [deleteTransaction],
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionCard
        transaction={item}
        canManage={canManage}
        onPress={() => handlePress(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [canManage, handlePress, handleDelete],
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const TYPE_FILTERS: Array<{ label: string; value: TransactionType | undefined }> = [
    { label: 'Semua', value: undefined },
    { label: 'Pemasukan', value: 'INCOME' },
    { label: 'Pengeluaran', value: 'EXPENSE' },
  ];

  return (
    <Screen padded edges={['top']} tabScreen>
      {/* ── Header ── */}
      <View style={styles.header}>
        <AppText variant="h3">Keuangan</AppText>
        {canManage ? (
          <Button label="+ Tambah" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      {/* ── Summary ── */}
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

      {/* ── Search ── */}
      <Input
        placeholder="Cari transaksi..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* ── Type Filter ── */}
      <View style={styles.filterRow}>
        {TYPE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.label}
            onPress={() => setTypeFilter(f.value)}
            activeOpacity={0.7}
            style={[styles.filterChip, typeFilter === f.value && styles.filterChipActive]}
          >
            <AppText
              variant="bodySm"
              color={typeFilter === f.value ? colors.neutral[0] : colors.text.secondary}
            >
              {f.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Total ── */}
      {!isLoading && !isError && data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.meta.total} transaksi ditemukan
        </AppText>
      ) : null}

      {/* ── List ── */}
      {isLoading ? (
        <SkeletonList count={5} />
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
            onPress={() => {
              refetch();
            }}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => {
                refetch();
              }}
              tintColor={colors.primary[500]}
            />
          }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  summaryCard: {
    flex: 1,
    gap: spacing[1],
    padding: spacing[3],
    alignItems: 'flex-start',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  summaryAmount: {
    fontWeight: fontWeight.semiBold,
  },

  // Search & filter
  searchInput: {
    marginBottom: spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginVertical: spacing[3],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  totalText: {
    marginBottom: spacing[3],
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing[3],
    paddingBottom: spacing[6],
  },

  // Transaction card
  txCard: {
    paddingVertical: spacing[3],
  },
  txHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    gap: spacing[1],
  },
  txDesc: {
    fontWeight: fontWeight.medium,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  txAmount: {
    fontWeight: fontWeight.semiBold,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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
