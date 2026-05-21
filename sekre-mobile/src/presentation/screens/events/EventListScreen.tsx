import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useEventsQuery } from '@hooks/events/useEventsQuery';
import { useDeleteEventMutation } from '@hooks/events/useDeleteEventMutation';
import { useAppSelector } from '@store/hooks';
import type { Event } from '@core/domain/entities/Event';
import type { EventsStackParamList } from '@app/navigation/EventsNavigator';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventList'>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateShort = (date: Date): string =>
  date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const isUpcoming = (date: Date): boolean => date >= new Date();

// ─── Event Card ───────────────────────────────────────────────────────────────

interface EventCardProps {
  event: Event;
  canManage: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, canManage, onPress, onEdit, onDelete }) => {
  const upcoming = isUpcoming(event.startDate);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.eventCard}>
        <View style={styles.cardHeader}>
          {/* Date box */}
          <View style={[styles.dateBox, upcoming ? styles.dateBoxUpcoming : undefined]}>
            <AppText
              style={styles.dateDay}
              color={upcoming ? colors.primary[600] : colors.text.secondary}
            >
              {event.startDate.getDate()}
            </AppText>
            <AppText
              style={styles.dateMonth}
              color={upcoming ? colors.primary[500] : colors.text.secondary}
            >
              {event.startDate.toLocaleDateString('id-ID', { month: 'short' })}
            </AppText>
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <AppText variant="bodyMd" style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </AppText>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color={colors.text.secondary} />
              <AppText variant="bodySm" color={colors.text.secondary}>
                {event.startDate.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {event.endDate
                  ? ` — ${event.endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                  : ''}
              </AppText>
            </View>
            {event.location ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={13} color={colors.text.secondary} />
                <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
                  {event.location}
                </AppText>
              </View>
            ) : null}
          </View>

          {/* Actions */}
          {canManage ? (
            <View style={styles.cardActions}>
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
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export const EventListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useEventsQuery({
    search: search.trim() || undefined,
    limit: 50,
  });

  const { mutate: deleteEvent } = useDeleteEventMutation();

  const handlePress = useCallback(
    (event: Event) => navigation.navigate('EventDetail', { eventId: event.id }),
    [navigation],
  );

  const handleCreate = useCallback(() => navigation.navigate('CreateEvent'), [navigation]);

  const handleEdit = useCallback(
    (event: Event) => navigation.navigate('EditEvent', { eventId: event.id }),
    [navigation],
  );

  const handleDelete = useCallback(
    (event: Event) => {
      Alert.alert('Hapus Acara', `Hapus acara "${event.title}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deleteEvent(event.id) },
      ]);
    },
    [deleteEvent],
  );

  const renderEvent = useCallback(
    ({ item }: { item: Event }) => (
      <EventCard
        event={item}
        canManage={canManage}
        onPress={() => handlePress(item)}
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [canManage, handlePress, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: Event) => item.id, []);

  return (
    <Screen padded edges={['top']} tabScreen>
      {/* ── Header ── */}
      <View style={styles.header}>
        <AppText variant="h3">Acara</AppText>
        {canManage ? (
          <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      {/* ── Search ── */}
      <Input
        placeholder="Cari acara..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* ── Total ── */}
      {!isLoading && !isError && data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.total} acara ditemukan
        </AppText>
      ) : null}

      {/* ── List ── */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : isError ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger.main} />
          <AppText variant="bodySm" color={colors.danger.main} style={styles.errorText}>
            Gagal memuat acara.
          </AppText>
          <Button
            label="Coba Lagi"
            variant="ghost"
            size="sm"
            onPress={() => void refetch()}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlatList
          data={data?.events ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderEvent}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => void refetch()}
              tintColor={colors.primary[500]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="Belum ada acara"
              description="Buat acara pertama untuk tim Anda."
              actionLabel={canManage ? '+ Buat Acara' : undefined}
              onAction={canManage ? handleCreate : undefined}
            />
          }
        />
      )}
    </Screen>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  searchInput: {
    marginBottom: spacing[2],
  },
  totalText: {
    marginVertical: spacing[3],
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing[3],
    paddingBottom: spacing[6],
  },

  // Card
  eventCard: {
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  dateBox: {
    width: 44,
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 10,
    paddingVertical: spacing[2],
  },
  dateBoxUpcoming: {
    backgroundColor: colors.primary[50],
  },
  dateDay: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  dateDayUpcoming: {
    color: colors.primary[600],
  },
  dateMonth: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  dateMonthUpcoming: {
    color: colors.primary[500],
  },
  cardInfo: {
    flex: 1,
    gap: spacing[1],
  },
  eventTitle: {
    fontWeight: fontWeight.semiBold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingTop: spacing[1],
  },
  description: {
    marginTop: spacing[1],
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
    gap: spacing[2],
  },
  errorText: {
    marginTop: spacing[1],
  },
  retryButton: {
    marginTop: spacing[1],
  },
});
