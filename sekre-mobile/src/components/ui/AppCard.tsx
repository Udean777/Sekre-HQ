import React from 'react';
import { View, ViewProps, Pressable, PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/utils/cn';

const cardVariants = cva('bg-white rounded-xl', {
  variants: {
    variant: {
      elevated: 'shadow-sm border border-gray-100',
      outlined: 'border border-gray-200',
      flat: 'bg-gray-50',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
  },
});

export interface AppCardProps
  extends ViewProps,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  onPress?: PressableProps['onPress'];
}

export function AppCard({
  className,
  variant,
  padding,
  children,
  onPress,
  ...props
}: AppCardProps) {
  const Component = onPress ? Pressable : View;
  
  return (
    <Component
      onPress={onPress}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
