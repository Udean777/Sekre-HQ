import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing } from '@presentation/theme';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  marginVertical?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  color = colors.border.default,
  marginVertical = spacing[3],
}) => {
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: color, marginVertical },
        style,
      ]}
      accessibilityRole="none"
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
