import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { cn } from '@/core/utils/cn';
import { AppText } from './AppText';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <View className={cn('mb-4', containerClassName)}>
        {label && (
          <AppText variant="label" className="mb-1.5 ml-1">
            {label}
          </AppText>
        )}

        <View
          className={cn(
            'flex-row items-center border rounded-lg bg-white px-3 py-1 min-h-[48px]',
            error
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 focus-within:border-blue-500 focus-within:bg-blue-50/10'
          )}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className={cn(
              'flex-1 text-base text-gray-900 placeholder:text-gray-400',
              className
            )}
            placeholderTextColor="#9ca3af"
            {...props}
          />

          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>

        {error ? (
          <AppText variant="caption" className="text-red-500 mt-1.5 ml-1">
            {error}
          </AppText>
        ) : helperText ? (
          <AppText variant="caption" className="mt-1.5 ml-1">
            {helperText}
          </AppText>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';
