import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '@presentation/theme';
import { AppText } from '../Text/Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...rest
}) => {
  const isDisabled = disabled ?? loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.neutral[0] : colors.primary[500]}
        />
      ) : (
        <>
          {leftIcon}
          <AppText style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
            {label}
          </AppText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.neutral[0],
    borderColor: colors.border.default,
  },
  ghost: {
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.danger.main,
    borderColor: colors.danger.main,
  },

  // Sizes
  sm: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    minHeight: 32,
  },
  md: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2] + 2,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    minHeight: 52,
  },

  // Label base
  label: {
    fontWeight: fontWeight.semiBold,
  },

  // Label variants
  label_primary: { color: colors.neutral[0] },
  label_secondary: { color: colors.text.primary },
  label_ghost: { color: colors.primary[500] },
  label_danger: { color: colors.neutral[0] },

  // Label sizes
  label_sm: { fontSize: fontSize.sm },
  label_md: { fontSize: fontSize.md },
  label_lg: { fontSize: fontSize.lg },
});
