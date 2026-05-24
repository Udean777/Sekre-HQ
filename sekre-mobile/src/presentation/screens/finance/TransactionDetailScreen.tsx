import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Button } from '@presentation/components/Button';
import { Badge, txTypeVariant, txStatusVariant } from '@presentation/components/Badge';
import { InfoRow } from '@presentation/components/InfoRow';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useTransactionQuery } from '@hooks/finance/useTransactionQuery';
import { useDeleteTransactionMutation } from '@hooks/finance/useDeleteTransactionMutation';
import { useAppSelector } from '@store/hooks';
import { selectAuthRole } from '@store/slices/authSlice';
import { formatMoney } from '@shared/utils/formatMoney';
import { formatDateTime } from '@shared/utils/formatDate';
import type { FinanceStackParamList } from '@app/navigation/FinanceNavigator';

type Props = NativeStackScreenProps<FinanceStackParamList, 'TransactionDetail'>;

const STATUS_LABEL: Readonly<Record<string, string>> = {
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PENDING: 'Menunggu',
} as const;

export const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transactionId } = route.params;
  const role = useAppSelector(selectAuthRole);
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
        onPress: (): void =>
          deleteTransaction(transactionId, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  }, [deleteTransaction, transactionId, navigation]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

  if (isError || !tx) {
    return (
      <Screen padded>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger.main} />
          <AppText variant="bodyMd" color={colors.danger.main} style={styles.errorText}>
            Gagal memuat detail transaksi.
          </AppText>
          <Button
            label="Kembali"
            variant="ghost"
            size="sm"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </Screen>
    );
  }

  const isIncome = tx.type === 'INCOME';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Hero amount ── */}
        <View style={styles.hero}>
          <View
            style={[
              styles.heroIcon,
              {
                backgroundColor: isIncome ? `${colors.success.main}18` : `${colors.danger.main}18`,
              },
            ]}
          >
            <Ionicons
              name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
              size={32}
              color={isIncome ? colors.success.main : colors.danger.main}
            />
          </View>
          <AppText
            variant="h2"
            style={styles.heroAmount}
            color={isIncome ? colors.success.main : colors.danger.main}
          >
            {isIncome ? '+' : '-'}
            {formatMoney(tx.amount)}
          </AppText>
          <View style={styles.heroBadges}>
            <Badge
              label={isIncome ? 'Pemasukan' : 'Pengeluaran'}
              variant={txTypeVariant(tx.type)}
            />
            <Badge
              label={STATUS_LABEL[tx.status] ?? tx.status}
              variant={txStatusVariant(tx.status)}
            />
          </View>
        </View>

        {/* ── Deskripsi ── */}
        <Card style={styles.descCard}>
          <AppText variant="label" color={colors.text.secondary} style={styles.descLabel}>
            Deskripsi
          </AppText>
          <AppText variant="bodyMd">{tx.description}</AppText>
        </Card>

        {/* ── Detail ── */}
        <Card style={styles.infoCard}>
          <InfoRow icon="layers-outline" label="ID Divisi" value={tx.divisionId} />
          {tx.eventId ? (
            <>
              <View style={styles.infoDivider} />
              <InfoRow icon="calendar-outline" label="ID Acara" value={tx.eventId} />
            </>
          ) : null}
          {tx.receiptUrl ? (
            <>
              <View style={styles.infoDivider} />
              <InfoRow
                icon="document-attach-outline"
                label="Bukti"
                value={tx.receiptUrl}
                valueColor={colors.primary[500]}
              />
            </>
          ) : null}
          <View style={styles.infoDivider} />
          <InfoRow icon="cash-outline" label="Mata Uang" value={tx.amount.currency} />
        </Card>

        {/* ── Meta ── */}
        <Card style={styles.infoCard}>
          <InfoRow icon="create-outline" label="Dibuat" value={formatDateTime(tx.createdAt)} />
          <View style={styles.infoDivider} />
          <InfoRow icon="refresh-outline" label="Diperbarui" value={formatDateTime(tx.updatedAt)} />
        </Card>

        {/* ── Actions ── */}
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
              <View style={styles.lockedNote}>
                <Ionicons name="lock-closed-outline" size={14} color={colors.text.secondary} />
                <AppText variant="bodySm" color={colors.text.secondary}>
                  Tidak dapat diedit — transaksi sudah{' '}
                  {tx.status === 'APPROVED' ? 'disetujui' : 'ditolak'}.
                </AppText>
              </View>
            )}
            <Button
              label="Hapus Transaksi"
              variant="danger"
              size="lg"
              fullWidth
              loading={isDeleting}
              onPress={handleDelete}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[6],
  },
  errorText: {
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing[1],
  },
  hero: {
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[5],
    paddingVertical: spacing[4],
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAmount: {
    fontWeight: fontWeight.bold,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  descCard: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  descLabel: {
    marginBottom: spacing[1],
  },
  infoCard: {
    marginBottom: spacing[4],
    gap: 0,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border.default,
  },
  actions: {
    gap: spacing[3],
  },
  lockedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: spacing[3],
  },
});
