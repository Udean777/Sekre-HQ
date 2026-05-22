import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '../Text/Text';
import { Button } from '../Button';
import { colors, spacing } from '@presentation/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IoniconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
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
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={32} color={colors.neutral[400]} />
    </View>
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
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
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
