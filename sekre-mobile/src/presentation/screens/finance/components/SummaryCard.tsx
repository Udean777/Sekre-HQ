import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '@presentation/components/Card';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { formatMoney } from '@shared/utils/formatMoney';
import type { Money } from '@core/domain/entities/Transaction';

export interface SummaryCardProps {
  label: string;
  icon: string;
  money: Money;
  color: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = React.memo(
  ({ label, icon, money, color }) => (
    <Card style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <AppText variant="bodySm" color={colors.text.secondary}>
        {label}
      </AppText>
      <AppText variant="bodyMd" style={[styles.amount, { color }]}>
        {formatMoney(money)}
      </AppText>
    </Card>
  ),
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing[1],
    padding: spacing[3],
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  amount: {
    fontWeight: fontWeight.semiBold,
  },
});
