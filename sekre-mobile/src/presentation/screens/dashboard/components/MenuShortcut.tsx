import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '@presentation/components/Card';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, fontWeight } from '@presentation/theme';

export interface MenuShortcutProps {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}

export const MenuShortcut: React.FC<MenuShortcutProps> = ({
  icon,
  label,
  description,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.wrapper}>
    <Card style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={colors.primary[500]} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyMd" style={styles.label}>
          {label}
        </AppText>
        <AppText variant="bodySm" color={colors.text.secondary}>
          {description}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
    </Card>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[3],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing[1],
  },
  label: {
    fontWeight: fontWeight.semiBold,
  },
});
