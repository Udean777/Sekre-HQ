import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '@presentation/components/Card';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, fontSize, fontWeight } from '@presentation/theme';

export interface StatCardProps {
  label: string;
  count: number;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, count, color }) => (
  <Card style={styles.card}>
    <AppText style={[styles.count, { color }]}>{count}</AppText>
    <AppText variant="bodySm" color={colors.text.secondary}>
      {label}
    </AppText>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[1],
  },
  count: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
});
