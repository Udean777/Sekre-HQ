import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/utils/cn';
import { AppText } from './AppText';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 active:bg-blue-700',
        secondary: 'bg-gray-200 active:bg-gray-300',
        outline: 'border-2 border-blue-600 bg-transparent active:bg-blue-50',
        ghost: 'bg-transparent active:bg-gray-100',
        destructive: 'bg-red-500 active:bg-red-600',
      },
      size: {
        sm: 'py-2 px-4 rounded-md',
        md: 'py-3 px-6 rounded-lg',
        lg: 'py-4 px-8 rounded-xl',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const buttonTextVariants = cva('text-center font-semibold', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-gray-900',
      outline: 'text-blue-600',
      ghost: 'text-blue-600',
      destructive: 'text-white',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export interface ButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant,
  size,
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={cn(
        buttonVariants({ variant, size }),
        isDisabled && 'opacity-50',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? 'white' : '#2563eb'}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <AppText className={cn(buttonTextVariants({ variant }))}>
            {children}
          </AppText>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
