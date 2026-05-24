import React from 'react';
import { ScrollView, View, StyleSheet, type ViewStyle, type ScrollViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@presentation/theme';
import { TAB_BAR_HEIGHT } from '@app/navigation/AppNavigator';

/**
 * ScreenMode:
 * - 'view'   — default, render View biasa (tidak scrollable)
 * - 'scroll' — render ScrollView (alias untuk scrollable=true lama)
 * - 'none'   — tidak render wrapper tambahan, child langsung di SafeAreaView.
 *              Pakai ini untuk screen yang sudah punya FlatList/FlashList
 *              sendiri supaya tidak ada nested scroll container.
 *
 * `scrollable` prop lama masih didukung untuk backward compat.
 */
type ScreenMode = 'view' | 'scroll' | 'none';

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  /**
   * Mode render wrapper:
   * - 'view'   — View biasa (default)
   * - 'scroll' — ScrollView
   * - 'none'   — tanpa wrapper, langsung di SafeAreaView
   */
  mode?: ScreenMode;
  /** @deprecated Pakai mode='scroll'. Masih didukung untuk backward compat. */
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /**
   * Safe area edges. Default: [].
   * Pass ['top'] untuk screen tanpa header navigator.
   */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /**
   * Set true untuk 5 screen utama di dalam bottom tab navigator.
   * Menambah paddingBottom agar konten tidak tertutup floating tab bar.
   */
  tabScreen?: boolean;
  /**
   * Set true untuk auth screens yang tidak punya tab bar sama sekali.
   */
  noTabBar?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  mode,
  scrollable = false,
  padded = true,
  style,
  contentStyle,
  edges = [],
  tabScreen = false,
  noTabBar: _noTabBar = false,
  ...rest
}) => {
  const insets = useSafeAreaInsets();

  // Resolve effective mode — mode prop takes precedence over legacy scrollable
  const effectiveMode: ScreenMode = mode ?? (scrollable ? 'scroll' : 'view');

  // tabScreen: perlu TAB_BAR_HEIGHT karena tab bar position absolute overlay konten
  // stack screens & auth: 0 — navigator sudah handle safe area, tidak perlu padding tambahan
  const extraBottom = tabScreen ? TAB_BAR_HEIGHT + insets.bottom : 0;

  const paddedStyle: ViewStyle = padded
    ? { padding: spacing[4], paddingBottom: spacing[4] + extraBottom }
    : extraBottom > 0
      ? { paddingBottom: extraBottom }
      : {};

  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      {effectiveMode === 'scroll' ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[paddedStyle, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : effectiveMode === 'none' ? (
        // 'none' — tidak ada wrapper tambahan, child langsung di SafeAreaView
        // Berguna untuk screen dengan FlatList/FlashList yang sudah handle scroll sendiri
        <>{children}</>
      ) : (
        // 'view' — default
        <View style={[styles.content, paddedStyle, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
