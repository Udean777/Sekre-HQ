import React from 'react';
import { View, ScrollView, ViewProps, ScrollViewProps } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { cn } from '@/core/utils/cn';

interface BaseScreenProps {
  children: React.ReactNode;
  className?: string;
  edges?: Edge[];
  backgroundColor?: string;
}

interface ScrollableScreenProps extends BaseScreenProps {
  scrollable?: true;
  scrollViewProps?: Omit<ScrollViewProps, 'children'>;
}

interface NonScrollableScreenProps extends BaseScreenProps {
  scrollable?: false;
  viewProps?: Omit<ViewProps, 'children'>;
}

type AppScreenProps = ScrollableScreenProps | NonScrollableScreenProps;

export function AppScreen({
  children,
  className,
  edges = ['top'], // default hanya top, karena bottom ditangani TabBar
  backgroundColor = 'bg-gray-50',
  scrollable = false,
  ...props
}: AppScreenProps) {
  const content = scrollable ? (
    <ScrollView
      className={cn('flex-1', className)}
      showsVerticalScrollIndicator={false}
      {...(props as ScrollableScreenProps).scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className={cn('flex-1', className)}
      {...(props as NonScrollableScreenProps).viewProps}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} className={cn('flex-1', backgroundColor)}>
      {content}
    </SafeAreaView>
  );
}
