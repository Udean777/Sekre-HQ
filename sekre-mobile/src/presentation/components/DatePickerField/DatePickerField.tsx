import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '../Text/Text';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';
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
  placeholder,
  error,
  hint,
  optional = false,
}) => {
  const [open, setOpen] = useState(false);
  const [iosStep, setIosStep] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const hasError = Boolean(error);
  const displayText = value
    ? mode === 'datetime'
      ? formatDateTime(value)
      : formatDate(value)
    : null;

  const handlePress = () => {
    setTempDate(value ?? new Date());
    setIosStep('date');
    setOpen(true);
  };

  const handleClear = () => onChange(null);

  const handleClose = () => {
    setOpen(false);
    setIosStep('date');
  };

  const handleConfirm = () => {
    if (mode === 'datetime' && iosStep === 'date') {
      setIosStep('time');
      return;
    }
    onChange(tempDate);
    setOpen(false);
    setIosStep('date');
  };

  // Android: native dialog langsung
  const handleAndroidChange = (_: unknown, selected?: Date) => {
    if (!selected) {
      setOpen(false);
      return;
    }
    if (mode === 'datetime' && iosStep === 'date') {
      setTempDate(selected);
      setIosStep('time');
    } else {
      onChange(selected);
      setOpen(false);
      setIosStep('date');
    }
  };

  const stepTitle =
    mode === 'datetime' ? (iosStep === 'date' ? 'Pilih Tanggal' : 'Pilih Waktu') : 'Pilih Tanggal';

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
        style={[styles.field, hasError && styles.fieldError]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={value ? colors.primary[500] : colors.text.disabled}
        />
        <AppText
          style={[styles.valueText, ...(value ? [] : [styles.placeholderText])]}
          numberOfLines={1}
        >
          {displayText ??
            placeholder ??
            (mode === 'datetime' ? 'Pilih tanggal & waktu' : 'Pilih tanggal')}
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
          <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
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

      {/* ── Android native dialog ── */}
      {Platform.OS === 'android' && open ? (
        <RNDateTimePicker
          value={tempDate}
          mode={mode === 'datetime' ? iosStep : 'date'}
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {/* ── iOS BottomSheet picker ── */}
      {Platform.OS === 'ios' ? (
        <BottomSheet
          visible={open}
          onClose={handleClose}
          title={stepTitle}
          snapTo={0.48}
          headerLeft={
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="bodyMd" color={colors.danger.main}>
                Batal
              </AppText>
            </TouchableOpacity>
          }
          headerRight={
            <TouchableOpacity
              onPress={handleConfirm}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="bodyMd" color={colors.primary[500]} style={styles.confirmText}>
                {mode === 'datetime' && iosStep === 'date' ? 'Lanjut →' : 'Selesai'}
              </AppText>
            </TouchableOpacity>
          }
          contentStyle={styles.pickerContent}
        >
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
        </BottomSheet>
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
  confirmText: {
    fontWeight: fontWeight.semiBold,
  },
  pickerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '100%',
    height: 200,
  },
});
