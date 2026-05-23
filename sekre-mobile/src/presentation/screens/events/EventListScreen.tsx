import React, { useState, useCallback, useMemo } from 'react';
import { View, SectionList, StyleSheet, Alert, RefreshControl } from 'react-native';
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
import type { Event, EventStatus } from '@core/domain/entities/Event';
import type { EventsStackParamList } from '@app/navigation/EventsNavigator';
import { EventTimelineCard } from './timeline/EventTimelineCard';
import { EventTimelineSectionHeader } from './timeline/EventTimelineSectionHeader';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventList'>;

// ─── Section order ────────────────────────────────────────────────────────────

const SECTION_ORDER: EventStatus[] = ['ONGOING', 'UPCOMING', 'DONE'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export const EventListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useEventsQuery({
    search: search.trim() || undefined,
    limit: 100,
  });

  const { mutate: deleteEvent } = useDeleteEventMutation();

  // ── Handlers ──────────────────────────────────────────────────────────────

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
        { text: 'Hapus', style: 'destructive', onPress: (): void => deleteEvent(event.id) },
      ]);
    },
    [deleteEvent],
  );

  // ── Build sections ────────────────────────────────────────────────────────

  const sections = useMemo(() => {
    const events = data?.events ?? [];

    const grouped: Record<EventStatus, Event[]> = {
      ONGOING: [],
      UPCOMING: [],
      DONE: [],
    };

    for (const event of events) {
      grouped[event.status].push(event);
    }

    // Sort UPCOMING ascending (soonest first), DONE descending (most recent first)
    grouped.UPCOMING.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    grouped.DONE.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    grouped.ONGOING.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return SECTION_ORDER.filter(status => grouped[status].length > 0).map(status => ({
      status,
      data: grouped[status],
    }));
  }, [data?.events]);

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <View style={styles.cardWrapper}>
        <EventTimelineCard
          event={item}
          canManage={canManage}
          onPress={() => handlePress(item)}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
        />
      </View>
    ),
    [canManage, handlePress, handleEdit, handleDelete],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { status: EventStatus; data: Event[] } }) => (
      <EventTimelineSectionHeader status={section.status} count={section.data.length} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: Event) => item.id, []);

  // ── Render states ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Screen padded edges={['top']} tabScreen>
        <View style={styles.header}>
          <AppText variant="h3">Acara</AppText>
        </View>
        <View style={styles.searchWrapper}>
          <Input placeholder="Cari acara." value={search} onChangeText={setSearch} />
        </View>
        <SkeletonList count={5} />
      </Screen>
    );
  }

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
            onPress={() => {
              refetch();
            }}
            style={styles.retryButton}
          />
        </View>
      </Screen>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <Screen padded={false} edges={['top']} tabScreen>
      {/* ── Header ── */}
      <View style={styles.header}>
        <AppText variant="h3">Acara</AppText>
        {canManage ? (
          <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrapper}>
        <Input placeholder="Cari acara." value={search} onChangeText={setSearch} />
      </View>

      {/* ── Total ── */}
      {data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.total} acara ditemukan
        </AppText>
      ) : null}

      {/* ── Timeline ── */}
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => {
              refetch();
            }}
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing[6],
    flexGrow: 1,
  },
  cardWrapper: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
  },

  // Error / loading states
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
