import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '@presentation/components/Text';
import { colors, spacing } from '@presentation/theme';
import { useNetworkStatus } from '@hooks/ui/useNetworkStatus';

/**
 * OfflineBanner — banner animasi yang muncul saat device offline.
 *
 * Slide down saat offline, slide up saat kembali online.
 * Render di atas semua konten — letakkan di RootNavigator atau AppNavigator.
 *
 * Tidak pakai absolute position supaya tidak overlap konten penting.
 * Pakai Animated.View dengan height animation supaya konten di bawah
 * tidak tertutup.
 */
export const OfflineBanner: React.FC = () => {
  const { isOffline } = useNetworkStatus();
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const BANNER_HEIGHT = 36;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOffline ? BANNER_HEIGHT : 0,
      duration: 250,
      useNativeDriver: false, // height tidak support native driver
    }).start();
  }, [isOffline, animatedHeight]);

  return (
    <Animated.View style={[styles.wrapper, { height: animatedHeight }]}>
      <View style={styles.banner}>
        <Ionicons name="cloud-offline-outline" size={14} color={colors.neutral[0]} />
        <AppText style={styles.text}>Tidak ada koneksi internet</AppText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: colors.neutral[700],
  },
  banner: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  text: {
    fontSize: 12,
    color: colors.neutral[0],
    fontWeight: '500',
  },
});
