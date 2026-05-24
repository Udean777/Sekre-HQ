import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@presentation/theme';

/**
 * ScreenSkeleton — fallback ringan untuk Suspense saat lazy navigator
 * belum selesai di-load. Tampil hanya pada first-mount tab baru,
 * bukan pada setiap navigasi.
 */
export const ScreenSkeleton: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator size="small" color={colors.primary[500]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.background,
  },
});
