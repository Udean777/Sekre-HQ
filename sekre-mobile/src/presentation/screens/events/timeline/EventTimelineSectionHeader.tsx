import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, fontWeight, radius } from '@presentation/theme';
import type { EventStatus } from '@core/domain/entities/Event';

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_CONFIG: Record<
  EventStatus,
  { label: string; icon: string; color: string; badgeBg: string }
> = {
  ONGOING: {
    label: 'Berlangsung',
    icon: 'radio-button-on',
    color: colors.warning.main,
    badgeBg: '#FFF8E1',
  },
  UPCOMING: {
    label: 'Akan Datang',
    icon: 'time-outline',
    color: colors.primary[500],
    badgeBg: colors.primary[50],
  },
  DONE: {
    label: 'Selesai',
    icon: 'checkmark-circle',
    color: colors.success.main,
    badgeBg: '#F0FDF4',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface EventTimelineSectionHeaderProps {
  status: EventStatus;
  count: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EventTimelineSectionHeader: React.FC<EventTimelineSectionHeaderProps> = React.memo(
  ({ status, count }) => {
    const config = SECTION_CONFIG[status];

    return (
      <View style={styles.container}>
        <View style={styles.left}>
          <Ionicons name={config.icon} size={15} color={config.color} />
          <AppText style={[styles.label, { color: config.color }]}>{config.label}</AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: config.badgeBg }]}>
          <AppText style={[styles.badgeText, { color: config.color }]}>{count}</AppText>
        </View>
        <View style={[styles.line, { backgroundColor: config.color + '30' }]} />
      </View>
    );
  },
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    backgroundColor: colors.surface.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  label: {
    fontSize: 13,
    fontWeight: fontWeight.semiBold,
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: fontWeight.semiBold,
  },
  line: {
    flex: 1,
    height: 1,
  },
});
