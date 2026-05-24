import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing } from '@presentation/theme';
import { useEventsQuery } from '@hooks/events/useEventsQuery';
import { useDeleteEventMutation } from '@hooks/events/useDeleteEventMutation';
import { useAppSelector } from '@store/hooks';
import { selectAuthRole } from '@store/slices/authSlice';
import { useDebouncedValue } from '@hooks/ui/useDebouncedValue';
import { flattenPages, lastPageMeta } from '@shared/utils/infiniteQueryHelpers';
import type { Event, EventStatus } from '@core/domain/entities/Event';
import type { EventsStackParamList } from '@app/navigation/EventsNavigator';
import { EventTimelineCard } from './timeline/EventTimelineCard';
import { EventTimelineSectionHeader } from './timeline/EventTimelineSectionHeader';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventList'>;

// ─── Constants (module scope) ─────────────────────────────────────────────────

const SECTION_ORDER: readonly EventStatus[] = ['ONGOING', 'UPCOMING', 'DONE'] as const;

// ─── Flat list item types ─────────────────────────────────────────────────────
// FlashList v2 pakai flat data + getItemType untuk mixed-type list.
// Ini lebih efisien dari SectionList karena FlashList bisa recycle view
// berdasarkan type.

type SectionHeaderItem = { kind: 'header'; status: EventStatus; count: number };
type EventItem = { kind: 'event'; event: Event };
type FlatItem = SectionHeaderItem | EventItem;

// ─── Screen ───────────────────────────────────────────────────────────────────

export const EventListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 300);

  const role = useAppSelector(selectAuthRole);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } = useEventsQuery({
    search: debouncedSearch.trim() || undefined,
    pageSize: 20,
  });

  const allEvents = flattenPages(data);
  const meta = lastPageMeta(data);

  const { mutate: deleteEvent } = useDeleteEventMutation();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePress = useCallback(
    (event: Event): void => navigation.navigate('EventDetail', { eventId: event.id }),
    [navigation],
  );

  const handleCreate = useCallback(
    (): void => navigation.navigate('CreateEvent'),
    [navigation],
  );

  const handleEdit = useCallback(
    (event: Event): void => navigation.navigate('EditEvent', { eventId: event.id }),
    [navigation],
  );

  const handleDelete = useCallback(
    (event: Event): void => {
      Alert.alert('Hapus Acara', `Hapus acara "${event.title}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: (): void => deleteEvent(event.id) },
      ]);
    },
    [deleteEvent],
  );

  const handleRefetch = useCallback((): void => { refetch(); }, [refetch]);

  // ── Build flat data (header + events per section) ─────────────────────────

  const flatData = useMemo((): readonly FlatItem[] => {
    const events = allEvents;

    const grouped: Record<EventStatus, Event[]> = {
      ONGOING: [],
      UPCOMING: [],
      DONE: [],
    };

    for (const event of events) {
      grouped[event.status].push(event);
    }

    grouped.UPCOMING.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    grouped.DONE.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    grouped.ONGOING.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const result: FlatItem[] = [];
    for (const status of SECTION_ORDER) {
      const sectionEvents = grouped[status];
      if (sectionEvents.length === 0) continue;
      result.push({ kind: 'header', status, count: sectionEvents.length });
      for (const event of sectionEvents) {
        result.push({ kind: 'event', event });
      }
    }
    return result;
  }, [allEvents]);

  // ── Render ────────────────────────────────────────────────────────────────

  const getItemType = useCallback((item: FlatItem): string => item.kind, []);

  const renderItem = useCallback<ListRenderItem<FlatItem>>(
    ({ item }) => {
      if (item.kind === 'header') {
        return (
          <EventTimelineSectionHeader status={item.status} count={item.count} />
        );
      }
      return (
        <View style={styles.cardWrapper}>
          <EventTimelineCard
            event={item.event}
            canManage={canManage}
            onPress={(): void => handlePress(item.event)}
            onEdit={(): void => handleEdit(item.event)}
            onDelete={(): void => handleDelete(item.event)}
          />
        </View>
      );
    },
    [canManage, handlePress, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: FlatItem): string =>
    item.kind === 'header' ? `header-${item.status}` : item.event.id,
  []);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Screen padded edges={['top']} tabScreen>
        <View style={styles.header}>
          <AppText variant="h3">Acara</AppText>
        </View>
        <View style={styles.searchWrapper}>
          <Input placeholder="Cari acara..." value={search} onChangeText={setSearch} />
        </View>
        <SkeletonList count={5} />
      </Screen>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (isError) {
    return (
      <Screen padded edges={['top']} tabScreen>
        <View style={styles.header}>
          <AppText variant="h3">Acara</AppText>
          {canManage ? (
            <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
          ) : null}
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger.main} />
          <AppText variant="bodySm" color={colors.danger.main} style={styles.errorText}>
            Gagal memuat acara.
          </AppText>
          <Button
            label="Coba Lagi"
            variant="ghost"
            size="sm"
            onPress={handleRefetch}
            style={styles.retryButton}
          />
        </View>
      </Screen>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <Screen mode="none" edges={['top']} tabScreen>
      {/* ── Header + Search (non-scrollable) ── */}
      <View style={styles.header}>
        <AppText variant="h3">Acara</AppText>
        {canManage ? (
          <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      <View style={styles.searchWrapper}>
        <Input placeholder="Cari acara..." value={search} onChangeText={setSearch} />
      </View>

      {meta ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {meta.total} acara ditemukan
        </AppText>
      ) : null}

      {/* ── Timeline (FlashList flat dengan mixed item types) ── */}
      <FlashList
        data={flatData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemType={getItemType}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefetch}
        refreshing={isFetching && !isLoading}
        onEndReached={hasNextPage ? (): void => { void fetchNextPage(); } : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <SkeletonList count={2} /> : null}
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
    </Screen>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  searchWrapper: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[1],
  },
  totalText: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[1],
  },
  listContent: {
    paddingBottom: spacing[6],
  },
  cardWrapper: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
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
