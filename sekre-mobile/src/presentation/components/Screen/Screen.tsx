import React from 'react';
import { ScrollView, View, StyleSheet, type ViewStyle, type ScrollViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@presentation/theme';
import { TAB_BAR_HEIGHT } from '@app/navigation/AppNavigator';

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
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

  // tabScreen: perlu TAB_BAR_HEIGHT karena tab bar position absolute overlay konten
  // stack screens & auth: 0 — navigator sudah handle safe area, tidak perlu padding tambahan
  const extraBottom = tabScreen ? TAB_BAR_HEIGHT + insets.bottom : 0;

  const paddedStyle: ViewStyle = padded
    ? { padding: spacing[4], paddingBottom: spacing[4] + extraBottom }
    : extraBottom > 0
      ? { paddingBottom: extraBottom }
      : {};

  const content = <View style={[styles.content, paddedStyle, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[paddedStyle, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        content
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
