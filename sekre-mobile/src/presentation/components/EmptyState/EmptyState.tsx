import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { AppText } from '../Text/Text';
import { Button } from '../Button';
import { colors, spacing, fontSize } from '@presentation/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => (
  <View
    style={[styles.container, style]}
    accessibilityRole="text"
    accessibilityLabel={`${title}${description ? '. ' + description : ''}`}
  >
    <AppText style={styles.icon}>{icon}</AppText>
    <AppText variant="bodyMd" style={styles.title}>
      {title}
    </AppText>
    {description ? (
      <AppText variant="bodySm" color={colors.text.secondary} style={styles.description}>
        {description}
      </AppText>
    ) : null}
    {actionLabel && onAction ? (
      <Button
        label={actionLabel}
        variant="primary"
        size="sm"
        onPress={onAction}
        style={styles.action}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  title: {
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[4],
  },
  action: {
    marginTop: spacing[2],
  },
});
