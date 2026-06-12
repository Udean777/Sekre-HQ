import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 active:bg-blue-700';
      case 'secondary':
        return 'bg-gray-200 active:bg-gray-300';
      case 'outline':
        return 'border-2 border-blue-600 bg-transparent active:bg-blue-50';
      case 'ghost':
        return 'bg-transparent active:bg-gray-100';
      default:
        return 'bg-blue-600';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-white font-semibold';
      case 'secondary':
        return 'text-gray-800 font-medium';
      case 'outline':
        return 'text-blue-600 font-semibold';
      case 'ghost':
        return 'text-blue-600 font-medium';
      default:
        return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-4 rounded-md';
      case 'md':
        return 'py-3 px-6 rounded-lg';
      case 'lg':
        return 'py-4 px-8 rounded-xl';
      default:
        return 'py-3 px-6 rounded-lg';
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${getVariantStyles()} ${getSizeStyles()} ${(disabled || isLoading) ? 'opacity-50' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#2563eb'} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`text-center ${getTextStyles()}`}>{children}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
