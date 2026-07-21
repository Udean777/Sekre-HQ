import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps 
} from 'react-native';
import { useTheme } from '../lib/hooks/use-theme';
import { ThemedText } from './themed-text';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export function Button({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  style, 
  disabled,
  ...props 
}: ButtonProps) {
  const theme = useTheme();
  
  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundSelected;
    switch (variant) {
      case 'primary': return theme.tint;
      case 'secondary': return theme.backgroundElement;
      case 'outline': return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled && variant !== 'outline') return theme.textSecondary;
    if (disabled && variant === 'outline') return theme.textSecondary;
    
    switch (variant) {
      case 'primary': return '#fff'; // White text on colored background typically
      case 'secondary': return theme.text;
      case 'outline': return theme.tint;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.backgroundSelected;
    return variant === 'outline' ? theme.tint : 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <ThemedText style={[styles.text, { color: getTextColor() }]}>
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  }
});
