import React, { useState, useCallback } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  type ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, fontSize, fontWeight } from '@presentation/theme';
import { AppText } from '../Text/Text';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { Input } from '../Input/Input';
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from '@shared/constants/currencies';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Deteksi locale user dari device.
 * Fallback ke 'id-ID' (Indonesia) jika tidak tersedia.
 */
export const getLocale = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'id-ID';
  } catch {
    return 'id-ID';
  }
};

/**
 * Deteksi currency code dari locale.
 * Mapping sederhana — fallback ke IDR.
 */
export const getCurrencyFromLocale = (locale: string): string => {
  const map: Record<string, string> = {
    id: 'IDR',
    'en-US': 'USD',
    'en-GB': 'GBP',
    ja: 'JPY',
    ko: 'KRW',
    zh: 'CNY',
    de: 'EUR',
    fr: 'EUR',
    it: 'EUR',
    es: 'EUR',
    'pt-BR': 'BRL',
    ms: 'MYR',
    th: 'THB',
    vi: 'VND',
    ar: 'SAR',
  };
  if (map[locale]) return map[locale];
  const prefix = locale.split('-')[0] ?? '';
  return map[prefix] ?? 'IDR';
};

/**
 * Format angka ke string mata uang sesuai locale.
 * Contoh (id-ID, IDR): 500000 → "Rp 500.000"
 * Contoh (en-US, USD): 500000 → "$500,000"
 */
export const formatCurrency = (value: number, locale: string, currency: string): string => {
  if (value === 0) return '';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
};

const stripNonDigits = (text: string): string => text.replace(/\D/g, '');

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrencyInputProps {
  label?: string;
  /**
   * Value dalam unit mata uang (bukan sen).
   * Contoh: 500000 = Rp 500.000
   */
  value: number;
  onChange: (value: number) => void;
  /** Kode mata uang ISO 4217, contoh: 'IDR', 'USD' */
  currency: string;
  onCurrencyChange: (currency: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

// ─── Currency Picker Item ─────────────────────────────────────────────────────

const CurrencyItem: React.FC<{
  item: SupportedCurrency;
  selected: boolean;
  onSelect: (code: string) => void;
}> = ({ item, selected, onSelect }) => (
  <TouchableOpacity
    style={[styles.currencyItem, selected && styles.currencyItemSelected]}
    onPress={() => onSelect(item.code)}
    activeOpacity={0.7}
  >
    <View style={styles.currencyItemLeft}>
      <AppText variant="bodyMd" style={[styles.currencyCode, ...(selected ? [styles.currencyCodeSelected] : [])]}>
        {item.code}
      </AppText>
      <AppText variant="bodySm" color={colors.text.secondary}>
        {item.name}
      </AppText>
    </View>
    <View style={styles.currencyItemRight}>
      <AppText variant="bodySm" color={colors.text.secondary} style={styles.currencySymbol}>
        {item.symbol}
      </AppText>
      {selected ? (
        <Ionicons name="checkmark" size={18} color={colors.primary[500]} />
      ) : null}
    </View>
  </TouchableOpacity>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  currency,
  onCurrencyChange,
  error,
  containerStyle,
}) => {
  const locale = getLocale();
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState(value > 0 ? String(value) : '');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState('');

  const hasError = Boolean(error);
  const formattedValue = value > 0 ? formatCurrency(value, locale, currency) : '';

  const filteredCurrencies = search.trim()
    ? SUPPORTED_CURRENCIES.filter(
        c =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : SUPPORTED_CURRENCIES;

  const handleChangeText = useCallback(
    (text: string) => {
      const digits = stripNonDigits(text);
      setRawText(digits);
      onChange(digits ? parseInt(digits, 10) : 0);
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setRawText(value > 0 ? String(value) : '');
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleSelectCurrency = useCallback(
    (code: string) => {
      onCurrencyChange(code);
      setPickerVisible(false);
      setSearch('');
    },
    [onCurrencyChange],
  );

  const handleClosePicker = useCallback(() => {
    setPickerVisible(false);
    setSearch('');
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          hasError && styles.inputWrapperError,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          returnKeyType="done"
          placeholderTextColor={colors.text.disabled}
          placeholder="0"
          value={isFocused ? rawText : formattedValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
        />

        {/* Currency badge — tappable */}
        <TouchableOpacity
          style={styles.currencyBadge}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel="Pilih mata uang"
          accessibilityRole="button"
        >
          <AppText variant="bodySm" style={styles.currencyText}>
            {currency}
          </AppText>
          <Ionicons name="chevron-down" size={12} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {hasError ? (
        <AppText variant="caption" color={colors.danger.main} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}

      {/* ── Currency Picker Bottom Sheet ── */}
      <BottomSheet
        visible={pickerVisible}
        onClose={handleClosePicker}
        title="Pilih Mata Uang"
        snapTo={0.65}
      >
        <View style={styles.pickerContainer}>
          <View style={styles.searchContainer}>
            <Input
              placeholder="Cari mata uang..."
              value={search}
              onChangeText={setSearch}
              leftIcon={<Ionicons name="search-outline" size={18} color={colors.text.secondary} />}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <FlatList
            data={filteredCurrencies}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <CurrencyItem
                item={item}
                selected={item.code === currency}
                onSelect={handleSelectCurrency}
              />
            )}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppText variant="bodyMd" color={colors.text.secondary}>
                  Mata uang tidak ditemukan
                </AppText>
              </View>
            }
          />
        </View>
      </BottomSheet>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
    minHeight: 44,
  },
  inputWrapperError: {
    borderColor: colors.border.error,
  },
  inputWrapperFocused: {
    borderColor: colors.primary[400],
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.primary,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[1],
    backgroundColor: colors.neutral[100],
    borderRadius: radius.sm,
    minWidth: 52,
    justifyContent: 'center',
  },
  currencyText: {
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  errorText: {
    marginTop: spacing[1],
  },

  // Picker
  pickerContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  currencyItemSelected: {
    backgroundColor: colors.primary[50],
  },
  currencyItemLeft: {
    flex: 1,
    gap: spacing[1],
  },
  currencyCode: {
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  currencyCodeSelected: {
    color: colors.primary[600],
  },
  currencyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  currencySymbol: {
    fontWeight: fontWeight.medium,
  },
  emptyContainer: {
    padding: spacing[6],
    alignItems: 'center',
  },
});
