import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@presentation/components/Text';
import { colors, fontWeight } from '@presentation/theme';

export interface AvatarProps {
  name: string;
  /** Diameter avatar dalam px. Default: 40 */
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = React.memo(({ name, size = 40 }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const radius = size / 2;
  const textSize = size * 0.35;

  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: radius }]}>
      <AppText style={[styles.text, { fontSize: textSize }]}>{initials}</AppText>
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
    // fontSize di-override via prop
  },
});
