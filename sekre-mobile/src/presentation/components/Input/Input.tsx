import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '@presentation/theme';
import { AppText } from '../Text/Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerStyle,
      style,
      ...rest
    },
    ref,
  ) => {
    const hasError = Boolean(error);

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <AppText variant="label" style={styles.label}>
            {label}
          </AppText>
        ) : null}

        <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon ? styles.inputWithLeftIcon : undefined,
              rightIcon ? styles.inputWithRightIcon : undefined,
              style,
            ]}
            placeholderTextColor={colors.text.disabled}
            accessibilityLabel={label}
            accessibilityHint={hint}
            {...rest}
          />

          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>

        {hasError ? (
          <AppText variant="caption" color={colors.danger.main} style={styles.errorText}>
            {error}
          </AppText>
        ) : hint ? (
          <AppText variant="caption" style={styles.hintText}>
            {hint}
          </AppText>
        ) : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  label: {
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
    minHeight: 44,
  },
  inputWrapperError: {
    borderColor: colors.border.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing[1],
  },
  inputWithRightIcon: {
    paddingRight: spacing[1],
  },
  iconLeft: {
    paddingLeft: spacing[3],
  },
  iconRight: {
    paddingRight: spacing[3],
  },
  errorText: {
    marginTop: spacing[1],
  },
  hintText: {
    marginTop: spacing[1],
    color: colors.text.secondary,
  },
});
