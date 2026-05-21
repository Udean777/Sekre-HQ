import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { dismissToast } from '@store/slices/uiSlice';
import type { Toast, ToastType } from '@store/slices/uiSlice';
import { colors, spacing, fontSize, fontWeight, radius } from '@presentation/theme';

const TOAST_DURATION = 3000;

const toastColors: Record<ToastType, { bg: string; text: string; border: string }> = {
  success: {
    bg: colors.success.light,
    text: colors.success.dark,
    border: colors.success.main,
  },
  error: {
    bg: colors.danger.light,
    text: colors.danger.dark,
    border: colors.danger.main,
  },
  warning: {
    bg: colors.warning.light,
    text: colors.warning.dark,
    border: colors.warning.main,
  },
  info: {
    bg: colors.info.light,
    text: colors.info.dark,
    border: colors.info.main,
  },
};

const toastIcon: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const { bg, text, border } = toastColors[toast.type];
  const icon = toastIcon[toast.type];
  const duration = toast.duration ?? TOAST_DURATION;

  useEffect(() => {
    // Fade in + slide down
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss(toast.id));
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, opacity, translateY, onDismiss]);

  return (
    <Animated.View
      style={[
        styles.toastItem,
        { backgroundColor: bg, borderLeftColor: border, opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: border }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.message, { color: text }]} numberOfLines={3}>
        {toast.message}
      </Text>
      <TouchableOpacity
        onPress={() => onDismiss(toast.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Tutup notifikasi"
        accessibilityRole="button"
      >
        <Text style={[styles.closeIcon, { color: text }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(state => state.ui.toasts);

  const handleDismiss = (id: string): void => {
    dispatch(dismissToast(id));
  };

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + spacing[2] }]} pointerEvents="box-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
    gap: spacing[2],
  },
  toastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderLeftWidth: 4,
    paddingVertical: spacing[3],
    paddingRight: spacing[3],
    paddingLeft: spacing[2],
    gap: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 12,
    color: colors.neutral[0],
    fontWeight: fontWeight.bold,
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },
  closeIcon: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    flexShrink: 0,
  },
});
