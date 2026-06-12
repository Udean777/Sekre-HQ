import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View, ActivityIndicator } from 'react-native';
import { cn } from '@/core/utils/cn';
import { AppText } from './AppText';

/**
 * SocialButton
 * Tombol reusable untuk OAuth provider (Google, Apple, dll.)
 * Mendukung light & dark mode secara otomatis.
 */

export interface SocialButtonProps extends TouchableOpacityProps {
  provider: 'google' | 'apple';
  isLoading?: boolean;
}

function GoogleIcon() {
  return (
    <View className="w-5 h-5 mr-3 items-center justify-center">
      <AppText variant="body" className="font-bold text-[15px] text-gray-800 dark:text-gray-100">G</AppText>
    </View>
  );
}

function AppleIcon() {
  return (
    <View className="w-5 h-5 mr-3 items-center justify-center">
      <AppText variant="body" className="font-bold text-[16px] text-white dark:text-gray-900 leading-none">
        &#63743;
      </AppText>
    </View>
  );
}

const providerConfig = {
  google: {
    label: 'Lanjutkan dengan Google',
    icon: GoogleIcon,
    className: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700',
  },
  apple: {
    label: 'Lanjutkan dengan Apple',
    icon: AppleIcon,
    className: 'bg-gray-950 dark:bg-gray-50 active:bg-gray-800 dark:active:bg-gray-200',
  },
};

export function SocialButton({
  provider,
  isLoading = false,
  className,
  ...props
}: SocialButtonProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;
  const isApple = provider === 'apple';

  return (
    <TouchableOpacity
      className={cn(
        'flex-row items-center justify-center rounded-xl py-3.5 px-6 min-h-[50px]',
        config.className,
        isLoading && 'opacity-50',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={isApple ? '#f9fafb' : '#374151'} />
      ) : (
        <>
          <Icon />
          <AppText
            variant="body"
            weight="semibold"
            className={cn(
              'text-[15px]',
              isApple
                ? 'text-white dark:text-gray-900'
                : 'text-gray-800 dark:text-gray-100'
            )}
          >
            {config.label}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
}
