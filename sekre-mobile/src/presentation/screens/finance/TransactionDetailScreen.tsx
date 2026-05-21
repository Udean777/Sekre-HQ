import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Button } from '@presentation/components/Button';
import { Badge, txTypeVariant, txStatusVariant } from '@presentation/components/Badge';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useTransactionQuery } from '@hooks/finance/useTransactionQuery';
import { useDeleteTransactionMutation } from '@hooks/finance/useDeleteTransactionMutation';
import { useAppSelector } from '@store/hooks';
import type { Money } from '@core/domain/entities/Transaction';
import type { FinanceStackParamList } from '@app/navigation/FinanceNavigator';

type Props = NativeStackScreenProps<FinanceStackParamList, 'TransactionDetail'>;

const formatMoney = (money: Money): string => {
  const amount = money.amountCents / 100;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date): string =>
  date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transactionId } = route.params;
  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data: tx, isLoading, isError } = useTransactionQuery(transactionId);
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransactionMutation();

  const canEdit = tx?.status === 'PENDING';

  const handleEdit = useCallback(() => {
    navigation.navigate('EditTransaction', { transactionId });
  }, [navigation, transactionId]);

  const handleDelete = useCallback(() => {
    Alert.alert('Hapus Transaksi', 'Apakah Anda yakin ingin menghapus transaksi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => deleteTransaction(transactionId, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  }, [deleteTransaction, transactionId, navigation]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

  if (isError || !tx) {
    return (
      <Screen padded>
        <AppText variant="bodySm" color={colors.danger.main}>
          Gagal memuat detail transaksi.
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

  const isIncome = tx.type === 'INCOME';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={styles.amountSection}>
          <Badge label={isIncome ? 'Pemasukan' : 'Pengeluaran'} variant={txTypeVariant(tx.type)} />
          <AppText
            variant="h2"
            style={[styles.amount, { color: isIncome ? colors.success.main : colors.danger.main }]}
          >
            {isIncome ? '+' : '-'} {formatMoney(tx.amount)}
          </AppText>
        </View>

        {/* Description */}
        <Card style={styles.card}>
          <AppText variant="label" color={colors.text.secondary}>
            Deskripsi
          </AppText>
          <Divider marginVertical={spacing[2]} />
          <AppText variant="bodyMd">{tx.description}</AppText>
        </Card>

        {/* Detail */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Status
            </AppText>
            <Badge
              label={
                tx.status === 'APPROVED'
                  ? 'Disetujui'
                  : tx.status === 'REJECTED'
                    ? 'Ditolak'
                    : 'Menunggu'
              }
              variant={txStatusVariant(tx.status)}
            />
          </View>
          <Divider marginVertical={spacing[2]} />
          <View style={styles.row}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Mata Uang
            </AppText>
            <AppText variant="bodyMd" style={styles.value}>
              {tx.amount.currency}
            </AppText>
          </View>
          {tx.eventId ? (
            <>
              <Divider marginVertical={spacing[2]} />
              <View style={styles.row}>
                <AppText variant="bodySm" color={colors.text.secondary}>
                  ID Acara
                </AppText>
                <AppText variant="bodyMd" style={styles.value} numberOfLines={1}>
                  {tx.eventId}
                </AppText>
              </View>
            </>
          ) : null}
          {tx.receiptUrl ? (
            <>
              <Divider marginVertical={spacing[2]} />
              <View style={styles.row}>
                <AppText variant="bodySm" color={colors.text.secondary}>
                  Bukti
                </AppText>
                <AppText
                  variant="bodySm"
                  color={colors.primary[500]}
                  numberOfLines={1}
                  style={styles.value}
                >
                  {tx.receiptUrl}
                </AppText>
              </View>
            </>
          ) : null}
        </Card>

        {/* Meta */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Dibuat
            </AppText>
            <AppText variant="bodyMd" style={styles.value}>
              {formatDate(tx.createdAt)}
            </AppText>
          </View>
          <Divider marginVertical={spacing[2]} />
          <View style={styles.row}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Diperbarui
            </AppText>
            <AppText variant="bodyMd" style={styles.value}>
              {formatDate(tx.updatedAt)}
            </AppText>
          </View>
        </Card>

        {/* Actions */}
        {canManage ? (
          <View style={styles.actions}>
            {canEdit ? (
              <Button
                label="Edit Transaksi"
                variant="secondary"
                size="lg"
                fullWidth
                onPress={handleEdit}
              />
            ) : (
              <AppText variant="bodySm" color={colors.text.secondary} style={styles.lockedNote}>
                Transaksi tidak dapat diedit karena sudah{' '}
                {tx.status === 'APPROVED' ? 'disetujui' : 'ditolak'}.
              </AppText>
            )}
            <Button
              label="Hapus Transaksi"
              variant="danger"
              size="lg"
              fullWidth
              loading={isDeleting}
              onPress={handleDelete}
              style={styles.deleteButton}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: spacing[4], paddingBottom: spacing[10] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { marginTop: spacing[3] },
  amountSection: { alignItems: 'center', gap: spacing[2], marginBottom: spacing[5] },
  amount: { fontWeight: fontWeight.bold },
  card: { marginBottom: spacing[4] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { fontWeight: fontWeight.medium, flex: 1, textAlign: 'right', marginLeft: spacing[3] },
  actions: { gap: spacing[3] },
  deleteButton: { marginTop: spacing[1] },
  lockedNote: { textAlign: 'center', marginBottom: spacing[2] },
});
