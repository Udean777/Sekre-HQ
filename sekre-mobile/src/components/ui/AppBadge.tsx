import React from 'react';
import { View, ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/utils/cn';
import { AppText } from './AppText';

const badgeVariants = cva('items-center justify-center rounded-full px-2.5 py-0.5', {
  variants: {
    variant: {
      default: 'bg-gray-100 dark:bg-gray-800',
      success: 'bg-emerald-100 dark:bg-emerald-900/40',
      warning: 'bg-amber-100 dark:bg-amber-900/40',
      error: 'bg-red-100 dark:bg-red-900/40',
      info: 'bg-blue-100 dark:bg-blue-900/40',
      outline: 'bg-transparent border border-gray-200 dark:border-gray-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const badgeTextVariants = cva('text-[10px] font-semibold uppercase tracking-wider', {
  variants: {
    variant: {
      default: 'text-gray-700 dark:text-gray-300',
      success: 'text-emerald-700 dark:text-emerald-400',
      warning: 'text-amber-700 dark:text-amber-400',
      error: 'text-red-700 dark:text-red-400',
      info: 'text-blue-700 dark:text-blue-400',
      outline: 'text-gray-700 dark:text-gray-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AppBadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {
  label: string;
}

export function AppBadge({
  className,
  variant,
  label,
  ...props
}: AppBadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <AppText className={badgeTextVariants({ variant })}>{label}</AppText>
    </View>
  );
}
