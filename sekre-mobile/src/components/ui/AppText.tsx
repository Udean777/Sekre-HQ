import React from 'react';
import { Text, TextProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/utils/cn';

const textVariants = cva('text-gray-900', {
  variants: {
    variant: {
      h1: 'text-3xl font-bold tracking-tight',
      h2: 'text-2xl font-bold tracking-tight',
      h3: 'text-xl font-bold',
      p: 'text-base leading-relaxed',
      body: 'text-sm leading-normal',
      caption: 'text-xs text-gray-500',
      label: 'text-sm font-medium text-gray-700',
    },
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'p',
    align: 'left',
  },
});

export interface AppTextProps
  extends TextProps,
    VariantProps<typeof textVariants> {
  children: React.ReactNode;
}

export function AppText({
  className,
  variant,
  weight,
  align,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      className={cn(textVariants({ variant, weight, align }), className)}
      {...props}
    >
      {children}
    </Text>
  );
}
