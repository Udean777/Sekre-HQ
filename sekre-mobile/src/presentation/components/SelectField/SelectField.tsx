import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '../Text/Text';
import { BottomSheet } from '../BottomSheet';
import { colors, spacing, radius, fontSize, fontWeight } from '@presentation/theme';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
}

interface SelectFieldProps<T = string> {
  label?: string;
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  loading?: boolean;
}

export function SelectField<T = string>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  error,
  hint,
  optional = false,
  loading = false,
}: SelectFieldProps<T>): React.ReactElement {
  const [open, setOpen] = useState(false);

  const hasError = Boolean(error);
  const selected = options.find(o => o.value === value);

  const handleSelect = (opt: SelectOption<T>) => {
    onChange(opt.value);
    setOpen(false);
  };

  const snapTo = Math.min(0.85, Math.max(0.35, 0.15 + options.length * 0.07));

  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
          {optional ? (
            <AppText variant="label" color={colors.text.secondary}>
              {' '}
              (opsional)
            </AppText>
          ) : null}
        </AppText>
      ) : null}

      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        style={[styles.field, hasError && styles.fieldError]}
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={loading}
      >
        {loading ? (
          <AppText style={styles.placeholderText}>Memuat...</AppText>
        ) : selected ? (
          <AppText style={styles.valueText} numberOfLines={1}>
            {selected.label}
          </AppText>
        ) : (
          <AppText style={styles.placeholderText} numberOfLines={1}>
            {placeholder}
          </AppText>
        )}
        <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
      </TouchableOpacity>

      {hasError ? (
        <AppText variant="caption" color={colors.danger.main} style={styles.helperText}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.text.secondary} style={styles.helperText}>
          {hint}
        </AppText>
      ) : null}

      {/* ── BottomSheet dropdown ── */}
      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={label ?? 'Pilih'}
        snapTo={snapTo}
      >
        <FlatList
          data={options}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => {
            const isSelected = item.value === value;
            return (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <View style={styles.optionContent}>
                  <AppText
                    variant="bodyMd"
                    style={isSelected ? styles.optionLabelSelected : undefined}
                  >
                    {item.label}
                  </AppText>
                  {item.description ? (
                    <AppText variant="bodySm" color={colors.text.secondary}>
                      {item.description}
                    </AppText>
                  ) : null}
                </View>
                {isSelected ? (
                  <Ionicons name="checkmark" size={18} color={colors.primary[500]} />
                ) : null}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText variant="bodySm" color={colors.text.secondary}>
                Tidak ada pilihan tersedia
              </AppText>
            </View>
          }
        />
      </BottomSheet>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  label: {
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
    minHeight: 44,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  fieldError: {
    borderColor: colors.border.error,
  },
  valueText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.primary,
  },
  placeholderText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.disabled,
  },
  helperText: {
    marginTop: spacing[1],
  },

  // Options
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionContent: {
    flex: 1,
    gap: spacing[1],
  },
  optionLabelSelected: {
    color: colors.primary[600],
    fontWeight: fontWeight.medium,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing[4],
  },
  emptyContainer: {
    padding: spacing[6],
    alignItems: 'center',
  },
});
