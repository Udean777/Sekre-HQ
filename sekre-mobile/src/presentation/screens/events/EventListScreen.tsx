import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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

const formatDate = (date: Date): string =>
  date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

interface EventCardProps {
  event: Event;
  canManage: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, canManage, onPress, onEdit, onDelete }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Card style={styles.eventCard}>
      <View style={styles.cardHeader}>
        <AppText variant="bodyMd" style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </AppText>
        {canManage ? (
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                onEdit();
              }}
              activeOpacity={0.7}
            >
              <AppText variant="bodySm" color={colors.primary[500]}>
                Edit
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                onDelete();
              }}
              activeOpacity={0.7}
            >
              <AppText variant="bodySm" color={colors.danger.main}>
                Hapus
              </AppText>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View style={styles.dateRow}>
        <AppText variant="bodySm" color={colors.primary[500]}>
          {formatDate(event.startDate)}
          {event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
        </AppText>
      </View>

      {event.location ? (
        <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
          📍 {event.location}
        </AppText>
      ) : null}

      {event.description ? (
        <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={2}>
          {event.description}
        </AppText>
      ) : null}
    </Card>
  </TouchableOpacity>
);

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
    (event: Event) => {
      navigation.navigate('EventDetail', { eventId: event.id });
    },
    [navigation],
  );

  const handleCreate = useCallback(() => {
    navigation.navigate('CreateEvent');
  }, [navigation]);

  const handleEdit = useCallback(
    (event: Event) => {
      navigation.navigate('EditEvent', { eventId: event.id });
    },
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
    <Screen padded>
      <View style={styles.header}>
        <AppText variant="h3">Acara</AppText>
        {canManage ? (
          <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      <Input
        placeholder="Cari acara..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {!isLoading && !isError && data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.total} acara
        </AppText>
      ) : null}

      {isLoading ? (
        <SkeletonList count={5} />
      ) : isError ? (
        <View style={styles.centered}>
          <AppText variant="bodySm" color={colors.danger.main}>
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
              icon="📅"
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  searchInput: { marginBottom: spacing[2] },
  totalText: { marginBottom: spacing[3] },
  listContent: { gap: spacing[3], paddingBottom: spacing[6] },
  eventCard: { gap: spacing[2] },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  eventTitle: { flex: 1, fontWeight: fontWeight.semiBold },
  cardActions: { flexDirection: 'row', gap: spacing[3] },
  dateRow: { flexDirection: 'row' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  retryButton: { marginTop: spacing[2] },
});
