import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '@presentation/components/Card';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, fontWeight, radius } from '@presentation/theme';
import type { Event, EventStatus } from '@core/domain/entities/Event';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<EventStatus, { label: string; color: string; bg: string }> = {
  UPCOMING: {
    label: 'Akan Datang',
    color: colors.primary[600],
    bg: colors.primary[50],
  },
  ONGOING: {
    label: 'Berlangsung',
    color: colors.warning.main,
    bg: '#FFF8E1',
  },
  DONE: {
    label: 'Selesai',
    color: colors.success.main,
    bg: '#F0FDF4',
  },
};

const DATE_BOX_BG: Record<EventStatus, string> = {
  UPCOMING: colors.primary[50],
  ONGOING: '#FFF8E1',
  DONE: colors.neutral[100],
};

const DATE_BOX_DAY_COLOR: Record<EventStatus, string> = {
  UPCOMING: colors.primary[600],
  ONGOING: colors.warning.main,
  DONE: colors.text.secondary,
};

const DATE_BOX_MONTH_COLOR: Record<EventStatus, string> = {
  UPCOMING: colors.primary[500],
  ONGOING: colors.warning.main,
  DONE: colors.text.secondary,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface EventTimelineCardProps {
  event: Event;
  canManage: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EventTimelineCard: React.FC<EventTimelineCardProps> = React.memo(
  ({ event, canManage, onPress, onEdit, onDelete }) => {
    const badge = STATUS_BADGE[event.status];

    const timeLabel = event.startDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTimeLabel = event.endDate
      ? event.endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : null;

    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card style={styles.card}>
          {/* ── Top row: date box + info + actions ── */}
          <View style={styles.topRow}>
            {/* Date box */}
            <View style={[styles.dateBox, { backgroundColor: DATE_BOX_BG[event.status] }]}>
              <AppText style={[styles.dateDay, { color: DATE_BOX_DAY_COLOR[event.status] }]}>
                {event.startDate.getDate()}
              </AppText>
              <AppText style={[styles.dateMonth, { color: DATE_BOX_MONTH_COLOR[event.status] }]}>
                {event.startDate.toLocaleDateString('id-ID', { month: 'short' })}
              </AppText>
            </View>

            {/* Info */}
            <View style={styles.info}>
              {/* Status badge */}
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <AppText style={[styles.statusLabel, { color: badge.color }]}>
                  {badge.label}
                </AppText>
              </View>

              <AppText variant="bodyMd" style={styles.title} numberOfLines={2}>
                {event.title}
              </AppText>

              {/* Time */}
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={13} color={colors.text.secondary} />
                <AppText variant="bodySm" color={colors.text.secondary}>
                  {timeLabel}
                  {endTimeLabel ? ` — ${endTimeLabel}` : ''}
                </AppText>
              </View>

              {/* Location */}
              {event.location ? (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={13} color={colors.text.secondary} />
                  <AppText
                    variant="bodySm"
                    color={colors.text.secondary}
                    numberOfLines={1}
                    style={styles.metaText}
                  >
                    {event.location}
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Actions */}
            {canManage ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger.main} />
                </TouchableOpacity>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            )}
          </View>

          {/* ── Description ── */}
          {event.description ? (
            <AppText
              variant="bodySm"
              color={colors.text.secondary}
              numberOfLines={2}
              style={styles.description}
            >
              {event.description}
            </AppText>
          ) : null}
        </Card>
      </TouchableOpacity>
    );
  },
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },

  // Date box
  dateBox: {
    width: 44,
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing[2],
    flexShrink: 0,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    lineHeight: 22,
  },
  dateMonth: {
    fontSize: 11,
    lineHeight: 14,
  },

  // Info
  info: {
    flex: 1,
    gap: spacing[1],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: fontWeight.semiBold,
  },
  title: {
    fontWeight: fontWeight.semiBold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    flex: 1,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingTop: spacing[1],
    flexShrink: 0,
  },

  // Description
  description: {
    marginTop: spacing[1],
  },
});
