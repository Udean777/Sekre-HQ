import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '@presentation/components/Text';
import { colors, spacing } from '@presentation/theme';

export interface FilterChipOption<T> {
  label: string;
  value: T;
}

export interface FilterChipsProps<T> {
  options: ReadonlyArray<FilterChipOption<T>>;
  value: T;
  onChange: (value: T) => void;
  style?: object;
}

// Generic component — React.FC tidak support generics langsung, pakai function declaration
export function FilterChips<T>({
  options,
  value,
  onChange,
  style,
}: FilterChipsProps<T>): React.ReactElement {
  return (
    <View style={[styles.row, style]}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
            style={[styles.chip, active && styles.chipActive]}
          >
            <AppText variant="bodySm" color={active ? colors.neutral[0] : colors.text.secondary}>
              {opt.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  chipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
});
