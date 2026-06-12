import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <View className="mb-4">
        {label && (
          <Text className="text-gray-700 font-medium mb-1.5 ml-1 text-sm">
            {label}
          </Text>
        )}
        
        <View className={`flex-row items-center border rounded-lg bg-white px-3 py-1 min-h-[48px] ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus-within:border-blue-500 focus-within:bg-blue-50/10'
        }`}>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          
          <TextInput
            ref={ref}
            className={`flex-1 text-base text-gray-900 placeholder:text-gray-400 ${className}`}
            placeholderTextColor="#9ca3af"
            {...props}
          />
          
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>

        {error ? (
          <Text className="text-red-500 text-xs mt-1.5 ml-1">{error}</Text>
        ) : helperText ? (
          <Text className="text-gray-500 text-xs mt-1.5 ml-1">{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';
