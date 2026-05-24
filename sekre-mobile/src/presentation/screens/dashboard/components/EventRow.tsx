import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, fontWeight, fontSize } from '@presentation/theme';
import type { Event } from '@core/domain/entities/Event';

export interface EventRowProps {
  event: Event;
}

export const EventRow: React.FC<EventRowProps> = ({ event }) => {
  const timeStr = event.startDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.row}>
      <View style={styles.dateBox}>
        <AppText variant="bodySm" style={styles.day}>
          {event.startDate.getDate()}
        </AppText>
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.month}>
          {event.startDate.toLocaleDateString('id-ID', { month: 'short' })}
        </AppText>
      </View>
      <View style={styles.content}>
        <AppText variant="bodyMd" numberOfLines={1} style={styles.title}>
          {event.title}
        </AppText>
        <AppText variant="bodySm" color={colors.text.secondary}>
          {timeStr}
          {event.location ? ` · ${event.location}` : ''}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  dateBox: {
    width: 36,
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    paddingVertical: spacing[1],
  },
  day: {
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    fontSize: fontSize.lg,
  },
  month: {
    fontSize: fontSize.xs,
    color: colors.primary[500],
  },
  content: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    fontWeight: fontWeight.medium,
  },
});
