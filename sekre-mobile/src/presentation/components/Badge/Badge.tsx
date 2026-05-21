import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '@presentation/theme';
import { AppText } from '../Text/Text';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

// Task status
export type TaskStatusBadge = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
// Task priority
export type TaskPriorityBadge = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
// Transaction type
export type TxTypeBadge = 'INCOME' | 'EXPENSE';
// Transaction status
export type TxStatusBadge = 'PENDING' | 'APPROVED' | 'REJECTED';
// Org role
export type RoleBadge = 'OWNER' | 'ADMIN' | 'MEMBER';
// Division role
export type DivisionRoleBadge = 'HEAD' | 'MEMBER';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.neutral[100], text: colors.text.secondary },
  primary: { bg: colors.primary[50], text: colors.primary[700] },
  success: { bg: colors.success.light, text: colors.success.dark },
  warning: { bg: colors.warning.light, text: colors.warning.dark },
  danger: { bg: colors.danger.light, text: colors.danger.dark },
  info: { bg: colors.info.light, text: colors.info.dark },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  const { bg, text } = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <AppText style={[styles.label, { color: text }]}>{label}</AppText>
    </View>
  );
};

// Convenience helpers — map domain values → Badge variant

export const taskStatusVariant = (status: TaskStatusBadge): BadgeVariant => {
  const map: Record<TaskStatusBadge, BadgeVariant> = {
    TODO: 'default',
    IN_PROGRESS: 'warning',
    DONE: 'success',
    CANCELLED: 'danger',
  };
  return map[status];
};

export const taskPriorityVariant = (priority: TaskPriorityBadge): BadgeVariant => {
  const map: Record<TaskPriorityBadge, BadgeVariant> = {
    LOW: 'default',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'danger',
  };
  return map[priority];
};

export const txTypeVariant = (type: TxTypeBadge): BadgeVariant => {
  return type === 'INCOME' ? 'success' : 'danger';
};

export const txStatusVariant = (status: TxStatusBadge): BadgeVariant => {
  const map: Record<TxStatusBadge, BadgeVariant> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
  };
  return map[status];
};

export const roleVariant = (role: RoleBadge): BadgeVariant => {
  const map: Record<RoleBadge, BadgeVariant> = {
    OWNER: 'primary',
    ADMIN: 'info',
    MEMBER: 'default',
  };
  return map[role];
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1] - 2,
    borderRadius: radius.full,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
