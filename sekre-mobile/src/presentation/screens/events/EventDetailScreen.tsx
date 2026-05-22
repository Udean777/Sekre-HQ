import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Button } from '@presentation/components/Button';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useEventQuery } from '@hooks/events/useEventQuery';
import { useDeleteEventMutation } from '@hooks/events/useDeleteEventMutation';
import { useAppSelector } from '@store/hooks';
import type { EventsStackParamList } from '@app/navigation/EventsNavigator';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetail'>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateLong = (date: Date): string =>
  date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (date: Date): string =>
  date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon as any} size={18} color={colors.primary[500]} />
    </View>
    <View style={styles.infoContent}>
      <AppText variant="bodySm" color={colors.text.secondary}>
        {label}
      </AppText>
      <AppText variant="bodyMd" style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

export const EventDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eventId } = route.params;
  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data: event, isLoading, isError } = useEventQuery(eventId);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEventMutation();

  const handleEdit = useCallback(() => {
    navigation.navigate('EditEvent', { eventId });
  }, [navigation, eventId]);

  const handleDelete = useCallback(() => {
    Alert.alert('Hapus Acara', 'Apakah Anda yakin ingin menghapus acara ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => deleteEvent(eventId, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  }, [deleteEvent, eventId, navigation]);

  // ── Loading ──
  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

  // ── Error ──
  if (isError || !event) {
    return (
      <Screen padded>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger.main} />
          <AppText variant="bodyMd" color={colors.danger.main} style={styles.errorText}>
            Gagal memuat detail acara.
          </AppText>
          <Button
            label="Kembali"
            variant="ghost"
            size="sm"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </Screen>
    );
  }

  const isUpcoming = event.startDate >= new Date();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={[styles.heroDateBox, isUpcoming ? styles.heroDateBoxUpcoming : undefined]}>
            <AppText
              style={styles.heroDay}
              color={isUpcoming ? colors.primary[600] : colors.text.secondary}
            >
              {event.startDate.getDate()}
            </AppText>
            <AppText
              style={styles.heroMonth}
              color={isUpcoming ? colors.primary[500] : colors.text.secondary}
            >
              {event.startDate.toLocaleDateString('id-ID', { month: 'long' })}
            </AppText>
            <AppText
              style={styles.heroYear}
              color={isUpcoming ? colors.primary[400] : colors.text.disabled}
            >
              {event.startDate.getFullYear()}
            </AppText>
          </View>
          <View style={styles.heroInfo}>
            <AppText variant="h3" style={styles.title}>
              {event.title}
            </AppText>
            {isUpcoming ? (
              <View style={styles.upcomingBadge}>
                <Ionicons name="time-outline" size={12} color={colors.primary[600]} />
                <AppText style={styles.upcomingText}>Mendatang</AppText>
              </View>
            ) : (
              <View style={styles.pastBadge}>
                <AppText style={styles.pastText}>Selesai</AppText>
              </View>
            )}
          </View>
        </View>

        {/* ── Info Card ── */}
        <Card style={styles.infoCard}>
          <InfoRow
            icon="calendar-outline"
            label="Tanggal Mulai"
            value={`${formatDateLong(event.startDate)} · ${formatTime(event.startDate)}`}
          />
          {event.endDate ? (
            <>
              <View style={styles.infoDivider} />
              <InfoRow
                icon="calendar-clear-outline"
                label="Tanggal Selesai"
                value={`${formatDateLong(event.endDate)} · ${formatTime(event.endDate)}`}
              />
            </>
          ) : null}
          {event.location ? (
            <>
              <View style={styles.infoDivider} />
              <InfoRow icon="location-outline" label="Lokasi" value={event.location} />
            </>
          ) : null}
        </Card>

        {/* ── Deskripsi ── */}
        {event.description ? (
          <Card style={styles.descCard}>
            <AppText variant="label" color={colors.text.secondary} style={styles.descLabel}>
              Deskripsi
            </AppText>
            <AppText variant="bodyMd" style={styles.descText}>
              {event.description}
            </AppText>
          </Card>
        ) : null}

        {/* ── Meta ── */}
        <Card style={styles.metaCard}>
          <InfoRow icon="create-outline" label="Dibuat" value={formatDateLong(event.createdAt)} />
          <View style={styles.infoDivider} />
          <InfoRow
            icon="refresh-outline"
            label="Diperbarui"
            value={formatDateLong(event.updatedAt)}
          />
        </Card>

        {/* ── Actions ── */}
        {canManage ? (
          <View style={styles.actions}>
            <Button
              label="Edit Acara"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleEdit}
            />
            <Button
              label="Hapus Acara"
              variant="danger"
              size="lg"
              fullWidth
              loading={isDeleting}
              onPress={handleDelete}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[6],
  },
  errorText: {
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing[1],
  },

  // Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  heroDateBox: {
    width: 64,
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 14,
    paddingVertical: spacing[3],
  },
  heroDateBoxUpcoming: {
    backgroundColor: colors.primary[50],
  },
  heroDay: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  heroDayUpcoming: {
    color: colors.primary[600],
  },
  heroMonth: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  heroMonthUpcoming: {
    color: colors.primary[500],
  },
  heroYear: {
    fontSize: 11,
    color: colors.text.disabled,
  },
  heroYearUpcoming: {
    color: colors.primary[400],
  },
  heroInfo: {
    flex: 1,
    gap: spacing[2],
    paddingTop: spacing[1],
  },
  title: {
    fontWeight: fontWeight.bold,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[50],
    borderRadius: 6,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.primary[600],
  },
  pastBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neutral[100],
    borderRadius: 6,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  pastText: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },

  // Info card
  infoCard: {
    marginBottom: spacing[4],
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: spacing[1],
  },
  infoValue: {
    fontWeight: fontWeight.medium,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border.default,
  },

  // Description
  descCard: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  descLabel: {
    marginBottom: spacing[1],
  },
  descText: {
    lineHeight: 22,
  },

  // Meta
  metaCard: {
    marginBottom: spacing[5],
    gap: 0,
  },

  // Actions
  actions: {
    gap: spacing[3],
  },
});
