import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../Text/Text';
import { colors, spacing, fontWeight } from '@presentation/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Snap point sebagai persentase tinggi layar, default 0.5 (50%) */
  snapTo?: number;
  /** Judul header opsional */
  title?: string;
  /** Konten kanan header (misal tombol Selesai) */
  headerRight?: React.ReactNode;
  /** Konten kiri header (misal tombol Batal) */
  headerLeft?: React.ReactNode;
  /** Style tambahan untuk container konten */
  contentStyle?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapTo = 0.5,
  title,
  headerRight,
  headerLeft,
  contentStyle,
}) => {
  const insets = useSafeAreaInsets();
  const sheetHeight = SCREEN_HEIGHT * snapTo;

  const translateY = useSharedValue(sheetHeight);
  const overlayOpacity = useSharedValue(0);
  const context = useSharedValue(0);

  const openSheet = useCallback(() => {
    overlayOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
    translateY.value = withSpring(0, SPRING_CONFIG);
  }, [overlayOpacity, translateY]);

  const closeSheet = useCallback(
    (onDone?: () => void) => {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(sheetHeight, { ...SPRING_CONFIG, damping: 25 }, finished => {
        if (finished && onDone) runOnJS(onDone)();
      });
    },
    [overlayOpacity, translateY, sheetHeight],
  );

  useEffect(() => {
    if (visible) {
      translateY.value = sheetHeight;
      openSheet();
    } else {
      closeSheet();
    }
  }, [visible, openSheet, closeSheet, sheetHeight, translateY]);

  const handleClose = useCallback(() => {
    closeSheet(onClose);
  }, [closeSheet, onClose]);

  // ── Drag gesture ──
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate(e => {
      const next = context.value + e.translationY;
      translateY.value = Math.max(0, next);
    })
    .onEnd(e => {
      const shouldClose = e.translationY > sheetHeight * 0.3 || e.velocityY > 800;
      if (shouldClose) {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        translateY.value = withSpring(sheetHeight, { ...SPRING_CONFIG, damping: 25 }, finished => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const hasHeader = title || headerLeft || headerRight;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* ── Overlay ── */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, overlayAnimStyle]} />
      </TouchableWithoutFeedback>

      {/* ── Sheet ── */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            { height: sheetHeight, paddingBottom: insets.bottom || spacing[4] },
            sheetAnimStyle,
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          {hasHeader ? (
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {headerLeft ?? <View style={styles.headerSpacer} />}
              </View>
              <AppText variant="bodyMd" style={styles.headerTitle}>
                {title ?? ''}
              </AppText>
              <View style={styles.headerRight}>
                {headerRight ?? <View style={styles.headerSpacer} />}
              </View>
            </View>
          ) : null}

          {/* Content */}
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
});
