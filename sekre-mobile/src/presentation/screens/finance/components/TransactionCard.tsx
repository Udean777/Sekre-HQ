import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '@presentation/components/Card';
import { AppText } from '@presentation/components/Text';
import { Badge, txStatusVariant } from '@presentation/components/Badge';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { formatMoney } from '@shared/utils/formatMoney';
import { formatDateShort } from '@shared/utils/formatDate';
import type { Transaction } from '@core/domain/entities/Transaction';

const STATUS_LABEL: Readonly<Record<string, string>> = {
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PENDING: 'Menunggu',
} as const;

export interface TransactionCardProps {
  transaction: Transaction;
  canManage: boolean;
  onPress: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = React.memo(
  ({ transaction, canManage, onPress, onDelete }) => {
    const isIncome = transaction.type === 'INCOME';

    const handlePress = useCallback((): void => onPress(transaction), [onPress, transaction]);
    const handleDelete = useCallback(
      (e: { stopPropagation: () => void }): void => {
        e.stopPropagation();
        onDelete(transaction);
      },
      [onDelete, transaction],
    );

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: isIncome
                    ? `${colors.success.main}18`
                    : `${colors.danger.main}18`,
                },
              ]}
            >
              <Ionicons
                name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
                size={18}
                color={isIncome ? colors.success.main : colors.danger.main}
              />
            </View>

            <View style={styles.info}>
              <AppText variant="bodyMd" style={styles.desc} numberOfLines={1}>
                {transaction.description}
              </AppText>
              <AppText variant="bodySm" color={colors.text.secondary}>
                {formatDateShort(transaction.createdAt)}
              </AppText>
            </View>

            <View style={styles.right}>
              <AppText
                variant="bodyMd"
                style={[
                  styles.amount,
                  { color: isIncome ? colors.success.main : colors.danger.main },
                ]}
              >
                {isIncome ? '+' : '-'}
                {formatMoney(transaction.amount)}
              </AppText>
              <View style={styles.meta}>
                <Badge
                  label={STATUS_LABEL[transaction.status] ?? transaction.status}
                  variant={txStatusVariant(transaction.status)}
                />
                {canManage ? (
                  <TouchableOpacity
                    onPress={handleDelete}
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
  },
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing[1],
  },
  desc: {
    fontWeight: fontWeight.medium,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  amount: {
    fontWeight: fontWeight.semiBold,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
