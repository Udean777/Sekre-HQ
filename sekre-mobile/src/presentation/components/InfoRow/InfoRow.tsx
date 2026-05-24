import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, fontWeight } from '@presentation/theme';

export interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  /** Override warna teks value. Default: colors.text.primary */
  valueColor?: string;
  /** Ukuran icon. Default: 16 */
  iconSize?: number;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  valueColor,
  iconSize = 16,
}) => (
  <View style={styles.row}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={iconSize} color={colors.primary[500]} />
    </View>
    <View style={styles.content}>
      <AppText variant="bodySm" color={colors.text.secondary}>
        {label}
      </AppText>
      <AppText variant="bodyMd" style={styles.value} color={valueColor}>
        {value}
      </AppText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing[1],
  },
  value: {
    fontWeight: fontWeight.medium,
  },
});
