import { colors } from './colors';
import { spacing } from './spacing';
import { fontFamily, fontSize, lineHeight, fontWeight } from './typography';
import { radius } from './radius';

export const theme = {
  colors,
  spacing,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  radius,
} as const;

export type Theme = typeof theme;

// Re-export individual tokens
export {
  colors,
  spacing,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  radius,
};
export type { Colors } from './colors';
export type { Spacing, SpacingKey } from './spacing';
export type { FontSize, FontSizeKey } from './typography';
export type { Radius, RadiusKey } from './radius';
