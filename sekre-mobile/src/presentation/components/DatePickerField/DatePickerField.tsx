import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '../Text/Text';
import { colors, spacing, radius, fontSize, fontWeight } from '@presentation/theme';

type Mode = 'date' | 'datetime';

interface DatePickerFieldProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode?: Mode;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

const formatDate = (date: Date): string =>
  date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatDateTime = (date: Date): string =>
  `${date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })} · ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  error,
  hint,
  optional = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  // iosStep hanya untuk datetime: 'date' dulu lalu 'time'
  const [iosStep, setIosStep] = useState<'date' | 'time'>('date');
  // tempDate untuk buffer sebelum confirm
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const hasError = Boolean(error);

  const displayText = value
    ? mode === 'datetime'
      ? formatDateTime(value)
      : formatDate(value)
    : null;

  const handlePress = () => {
    if (!expanded) {
      setTempDate(value ?? new Date());
      setIosStep('date');
    }
    setExpanded(prev => !prev);
  };

  const handleClear = () => {
    onChange(null);
    setExpanded(false);
  };

  const handleConfirm = () => {
    if (mode === 'datetime' && iosStep === 'date') {
      setIosStep('time');
      return;
    }
    onChange(tempDate);
    setExpanded(false);
    setIosStep('date');
  };

  const handleCancel = () => {
    setExpanded(false);
    setIosStep('date');
  };

  // Android: native dialog
  const handleAndroidChange = (_: unknown, selected?: Date) => {
    if (!selected) return;
    if (mode === 'datetime' && iosStep === 'date') {
      setTempDate(selected);
      setIosStep('time');
    } else {
      onChange(selected);
      setIosStep('date');
      setExpanded(false);
    }
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

      {/* ── Field trigger ── */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.field, hasError && styles.fieldError, expanded && styles.fieldActive]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={expanded || value ? colors.primary[500] : colors.text.disabled}
        />
        <AppText
          style={[styles.valueText, ...(value ? [] : [styles.placeholderText])]}
          numberOfLines={1}
        >
          {displayText ?? (mode === 'datetime' ? 'Pilih tanggal & waktu' : 'Pilih tanggal')}
        </AppText>
        {value && optional ? (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Hapus tanggal"
          >
            <Ionicons name="close-circle" size={18} color={colors.neutral[400]} />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.text.secondary}
          />
        )}
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

      {/* ── iOS inline picker ── */}
      {Platform.OS === 'ios' && expanded ? (
        <View style={styles.pickerContainer}>
          {/* Step label untuk datetime */}
          {mode === 'datetime' ? (
            <AppText variant="bodySm" color={colors.text.secondary} style={styles.stepLabel}>
              {iosStep === 'date' ? 'Pilih Tanggal' : 'Pilih Waktu'}
            </AppText>
          ) : null}

          <RNDateTimePicker
            value={tempDate}
            mode={mode === 'datetime' ? iosStep : 'date'}
            display="spinner"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onValueChange={(_event, date) => {
              if (date) setTempDate(date);
            }}
            locale="id-ID"
            themeVariant="light"
            accentColor={colors.primary[500]}
            style={styles.spinner}
          />

          {/* Action buttons */}
          <View style={styles.pickerActions}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
              <AppText variant="bodyMd" color={colors.text.secondary}>
                Batal
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
              <AppText variant="bodyMd" color={colors.text.inverse} style={styles.confirmText}>
                {mode === 'datetime' && iosStep === 'date' ? 'Lanjut →' : 'Selesai'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* ── Android native dialog ── */}
      {Platform.OS === 'android' && expanded ? (
        <RNDateTimePicker
          value={tempDate}
          mode={mode === 'datetime' ? iosStep : 'date'}
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleAndroidChange}
        />
      ) : null}
    </View>
  );
};

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
  fieldActive: {
    borderColor: colors.primary[500],
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  valueText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.disabled,
  },
  helperText: {
    marginTop: spacing[1],
  },

  // Picker container — muncul di bawah field
  pickerContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.primary[500],
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    backgroundColor: colors.neutral[0],
    overflow: 'hidden',
  },
  stepLabel: {
    textAlign: 'center',
    paddingTop: spacing[3],
    paddingHorizontal: spacing[4],
  },
  spinner: {
    width: '100%',
    height: 180,
  },
  pickerActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
  },
  confirmText: {
    fontWeight: fontWeight.semiBold,
  },
});
