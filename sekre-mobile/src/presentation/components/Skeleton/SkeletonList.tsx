import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonCard } from './SkeletonCard';
import { spacing } from '@presentation/theme';

interface SkeletonListProps {
  count?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 5 }) => (
  <View style={styles.container}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
    paddingBottom: spacing[6],
  },
});
