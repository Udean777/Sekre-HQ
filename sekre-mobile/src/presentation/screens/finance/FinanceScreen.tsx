import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { Badge, txTypeVariant, txStatusVariant } from '@presentation/components/Badge';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useTransactionsQuery } from '@hooks/finance/useTransactionsQuery';
import { useFinanceSummaryQuery } from '@hooks/finance/useFinanceSummaryQuery';
import { useDeleteTransactionMutation } from '@hooks/finance/useDeleteTransactionMutation';
import { useAppSelector } from '@store/hooks';
import type { Transaction, TransactionType, Money } from '@core/domain/entities/Transaction';
import type { FinanceStackParamList } from '@app/navigation/FinanceNavigator';

type Props = NativeStackScreenProps<FinanceStackParamList, 'FinanceList'>;

// Format amount_cents ke rupiah
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

interface SummaryCardProps {
  label: string;
  money: Money;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, money, color }) => (
  <Card style={styles.summaryCard}>
    <AppText variant="bodySm" color={colors.text.secondary}>
      {label}
    </AppText>
    <AppText variant="bodyMd" style={[styles.summaryAmount, { color }]}>
      {formatMoney(money)}
    </AppText>
  </Card>
);

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
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Card style={styles.txCard}>
      <View style={styles.txHeader}>
        <View style={styles.txLeft}>
          <Badge
            label={transaction.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
            variant={txTypeVariant(transaction.type)}
          />
          <AppText variant="bodySm" color={colors.text.secondary} style={styles.txDate}>
            {formatDate(transaction.createdAt)}
          </AppText>
        </View>
        <AppText
          variant="bodyMd"
          style={[
            styles.txAmount,
            {
              color: transaction.type === 'INCOME' ? colors.success.main : colors.danger.main,
            },
          ]}
        >
          {transaction.type === 'INCOME' ? '+' : '-'} {formatMoney(transaction.amount)}
        </AppText>
      </View>

      <AppText variant="bodyMd" numberOfLines={2} style={styles.txDesc}>
        {transaction.description}
      </AppText>

      <View style={styles.txFooter}>
        <Badge
          label={
            transaction.status === 'APPROVED'
              ? 'Disetujui'
              : transaction.status === 'REJECTED'
                ? 'Ditolak'
                : 'Menunggu'
          }
          variant={txStatusVariant(transaction.status)}
        />
        {canManage ? (
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <AppText variant="bodySm" color={colors.danger.main}>
              Hapus
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    </Card>
  </TouchableOpacity>
);

export const FinanceScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(undefined);
  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useTransactionsQuery({
    search: search.trim() || undefined,
    type: typeFilter,
    pageSize: 50,
  });

  const { data: summary } = useFinanceSummaryQuery();
  const { mutate: deleteTransaction } = useDeleteTransactionMutation();

  const handlePress = useCallback(
    (tx: Transaction) => {
      navigation.navigate('TransactionDetail', { transactionId: tx.id });
    },
    [navigation],
  );

  const handleCreate = useCallback(() => {
    navigation.navigate('CreateTransaction');
  }, [navigation]);

  const handleDelete = useCallback(
    (tx: Transaction) => {
      Alert.alert('Hapus Transaksi', `Hapus transaksi "${tx.description}"?`, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteTransaction(tx.id),
        },
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
    <Screen padded>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h3">Keuangan</AppText>
        {canManage ? (
          <Button label="+ Tambah" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      {/* Summary Cards */}
      {summary ? (
        <View style={styles.summaryRow}>
          <SummaryCard label="Pemasukan" money={summary.totalIncome} color={colors.success.main} />
          <SummaryCard
            label="Pengeluaran"
            money={summary.totalExpense}
            color={colors.danger.main}
          />
          <SummaryCard label="Saldo" money={summary.balance} color={colors.primary[500]} />
        </View>
      ) : null}

      {/* Search */}
      <Input
        placeholder="Cari transaksi..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* Type Filter */}
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

      {!isLoading && !isError && data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.total} transaksi
        </AppText>
      ) : null}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <AppText variant="bodySm" color={colors.danger.main}>
            Gagal memuat transaksi.
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
          data={data?.transactions ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
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
            <View style={styles.centered}>
              <AppText variant="bodySm" color={colors.text.secondary}>
                Belum ada transaksi.
              </AppText>
            </View>
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  summaryCard: {
    flex: 1,
    gap: spacing[1],
    padding: spacing[3],
  },
  summaryAmount: { fontWeight: fontWeight.semiBold },
  searchInput: { marginBottom: spacing[2] },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
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
  totalText: { marginBottom: spacing[3] },
  listContent: { gap: spacing[3], paddingBottom: spacing[6] },
  txCard: { gap: spacing[2] },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txLeft: { gap: spacing[1] },
  txDate: { marginTop: spacing[1] },
  txAmount: { fontWeight: fontWeight.semiBold },
  txDesc: { color: colors.text.primary },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  retryButton: { marginTop: spacing[2] },
});
