import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { colors, spacing, radius } from '@presentation/theme';

export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    {/* Header row */}
    <View style={styles.headerRow}>
      <SkeletonBox width="60%" height={16} />
      <SkeletonBox width={60} height={20} borderRadius={radius.full} />
    </View>
    {/* Body lines */}
    <SkeletonBox width="90%" height={12} style={styles.line} />
    <SkeletonBox width="70%" height={12} style={styles.line} />
    {/* Footer row */}
    <View style={styles.footerRow}>
      <SkeletonBox width={80} height={12} />
      <SkeletonBox width={50} height={12} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    padding: spacing[4],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  line: {
    marginVertical: spacing[1],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
});
