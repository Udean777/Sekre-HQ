import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '../Text/Text';
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

      {/* ── Modal dropdown ── */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={styles.modalContainer}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <AppText variant="bodyMd" style={styles.sheetTitle}>
                {label ?? 'Pilih'}
              </AppText>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Options */}
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
              style={styles.optionList}
            />
          </View>
        </View>
      </Modal>
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

  // Modal
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.overlay,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: spacing[6],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sheetTitle: {
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  optionList: {
    flexGrow: 0,
  },
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
});
