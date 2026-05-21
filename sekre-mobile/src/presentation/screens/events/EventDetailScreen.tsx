import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Button } from '@presentation/components/Button';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useEventQuery } from '@hooks/events/useEventQuery';
import { useDeleteEventMutation } from '@hooks/events/useDeleteEventMutation';
import { useAppSelector } from '@store/hooks';
import type { EventsStackParamList } from '@app/navigation/EventsNavigator';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetail'>;

const formatDate = (date: Date): string =>
  date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

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

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

  if (isError || !event) {
    return (
      <Screen padded>
        <AppText variant="bodySm" color={colors.danger.main}>
          Gagal memuat detail acara.
        </AppText>
        <Button
          label="Kembali"
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <AppText variant="h3" style={styles.title}>
          {event.title}
        </AppText>

        {/* Date */}
        <AppText variant="bodyMd" color={colors.primary[500]} style={styles.date}>
          {formatDate(event.startDate)}
          {event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
        </AppText>

        {/* Location */}
        {event.location ? (
          <AppText variant="bodyMd" color={colors.text.secondary} style={styles.location}>
            📍 {event.location}
          </AppText>
        ) : null}

        {/* Description */}
        {event.description ? (
          <Card style={styles.descCard}>
            <AppText variant="label" color={colors.text.secondary}>
              Deskripsi
            </AppText>
            <Divider marginVertical={spacing[2]} />
            <AppText variant="bodyMd">{event.description}</AppText>
          </Card>
        ) : null}

        {/* Meta */}
        <Card style={styles.metaCard}>
          <View style={styles.metaRow}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Dibuat
            </AppText>
            <AppText variant="bodyMd" style={styles.metaValue}>
              {formatDate(event.createdAt)}
            </AppText>
          </View>
          <Divider marginVertical={spacing[2]} />
          <View style={styles.metaRow}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Diperbarui
            </AppText>
            <AppText variant="bodyMd" style={styles.metaValue}>
              {formatDate(event.updatedAt)}
            </AppText>
          </View>
        </Card>

        {/* Actions */}
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
              style={styles.deleteButton}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: spacing[4], paddingBottom: spacing[10] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { marginTop: spacing[3] },
  title: { fontWeight: fontWeight.bold, marginBottom: spacing[2] },
  date: { marginBottom: spacing[2] },
  location: { marginBottom: spacing[4] },
  descCard: { marginBottom: spacing[4] },
  metaCard: { marginBottom: spacing[5] },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaValue: { fontWeight: fontWeight.medium },
  actions: { gap: spacing[3] },
  deleteButton: { marginTop: spacing[1] },
});
