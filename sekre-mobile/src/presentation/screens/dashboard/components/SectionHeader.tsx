import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '@presentation/components/Text';
import { colors, spacing } from '@presentation/theme';

export interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onViewAll }) => (
  <View style={styles.row}>
    <AppText variant="h4">{title}</AppText>
    {onViewAll ? (
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
        <AppText variant="bodySm" color={colors.primary[500]}>
          Lihat Semua
        </AppText>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[3],
  },
});
