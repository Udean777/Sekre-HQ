import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, taskStatusVariant, taskPriorityVariant } from '@presentation/components/Badge';
import { Button } from '@presentation/components/Button';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useTaskQuery } from '@hooks/tasks/useTaskQuery';
import { useDeleteTaskMutation } from '@hooks/tasks/useDeleteTaskMutation';
import { useUpdateTaskStatusMutation } from '@hooks/tasks/useUpdateTaskStatusMutation';
import { useDivisionName } from '@hooks/divisions/useDivisionName';
import { useAppSelector } from '@store/hooks';
import type { TaskStatus, TaskPriority } from '@core/domain/entities/Task';
import type { TasksStackParamList } from '@app/navigation/TasksNavigator';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Belum Mulai',
  IN_PROGRESS: 'Sedang Berjalan',
  DONE: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  URGENT: 'Mendesak',
};

const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
};

const NEXT_STATUS_LABEL: Partial<Record<TaskStatus, string>> = {
  TODO: 'Mulai Kerjakan',
  IN_PROGRESS: 'Tandai Selesai',
};

const NEXT_STATUS_ICON: Partial<Record<TaskStatus, string>> = {
  TODO: 'play-circle-outline',
  IN_PROGRESS: 'checkmark-circle-outline',
};

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

export const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;

  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data: task, isLoading, isError } = useTaskQuery(taskId);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTaskStatusMutation();
  const divisionName = useDivisionName(task?.divisionId ?? null);

  const handleEdit = useCallback(() => {
    navigation.navigate('EditTask', { taskId });
  }, [navigation, taskId]);

  const handleDelete = useCallback(() => {
    Alert.alert('Hapus Tugas', 'Apakah Anda yakin ingin menghapus tugas ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => deleteTask(taskId, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  }, [deleteTask, navigation, taskId]);

  const handleStatusAdvance = useCallback(() => {
    if (!task) return;
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    updateStatus({ id: taskId, status: next });
  }, [task, taskId, updateStatus]);

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
  if (isError || !task) {
    return (
      <Screen padded>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger.main} />
          <AppText variant="bodyMd" color={colors.danger.main} style={styles.errorText}>
            Gagal memuat detail tugas.
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

  const nextStatus = NEXT_STATUS[task.status];
  const isDone = task.status === 'DONE';
  const isCancelled = task.status === 'CANCELLED';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View
            style={[
              styles.heroIcon,
              isDone && styles.heroIconDone,
              isCancelled && styles.heroIconCancelled,
            ]}
          >
            <Ionicons
              name={isDone ? 'checkmark-circle' : isCancelled ? 'close-circle' : 'ellipse-outline'}
              size={32}
              color={
                isDone
                  ? colors.success.main
                  : isCancelled
                    ? colors.neutral[400]
                    : colors.primary[500]
              }
            />
          </View>
          <View style={styles.heroInfo}>
            <AppText variant="h3" style={styles.title}>
              {task.title}
            </AppText>
            <View style={styles.badgeRow}>
              <Badge label={STATUS_LABEL[task.status]} variant={taskStatusVariant(task.status)} />
              <Badge
                label={PRIORITY_LABEL[task.priority]}
                variant={taskPriorityVariant(task.priority)}
              />
            </View>
          </View>
        </View>

        {/* ── Deskripsi ── */}
        {task.description ? (
          <Card style={styles.descCard}>
            <AppText variant="label" color={colors.text.secondary} style={styles.descLabel}>
              Deskripsi
            </AppText>
            <AppText variant="bodyMd" style={styles.descText}>
              {task.description}
            </AppText>
          </Card>
        ) : null}

        {/* ── Detail ── */}
        <Card style={styles.infoCard}>
          <InfoRow
            icon="person-outline"
            label="Penanggung Jawab"
            value={task.assigneeName ?? 'Belum ditentukan'}
          />
          <View style={styles.infoDivider} />
          <InfoRow
            icon="business-outline"
            label="Divisi"
            value={divisionName ?? task.divisionName ?? 'Belum ditentukan'}
          />
          {task.dueDate ? (
            <>
              <View style={styles.infoDivider} />
              <InfoRow
                icon="calendar-outline"
                label="Tenggat"
                value={task.dueDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </>
          ) : null}
        </Card>

        {/* ── Meta ── */}
        <Card style={styles.metaCard}>
          <InfoRow
            icon="create-outline"
            label="Dibuat"
            value={task.createdAt.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <View style={styles.infoDivider} />
          <InfoRow
            icon="refresh-outline"
            label="Diperbarui"
            value={task.updatedAt.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
        </Card>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          {nextStatus ? (
            <Button
              label={NEXT_STATUS_LABEL[task.status] ?? 'Update Status'}
              variant="primary"
              size="lg"
              fullWidth
              loading={isUpdatingStatus}
              onPress={handleStatusAdvance}
            />
          ) : null}

          {canManage ? (
            <>
              <Button
                label="Edit Tugas"
                variant="secondary"
                size="lg"
                fullWidth
                onPress={handleEdit}
              />
              <Button
                label="Hapus Tugas"
                variant="danger"
                size="lg"
                fullWidth
                loading={isDeleting}
                onPress={handleDelete}
              />
            </>
          ) : null}
        </View>
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
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconDone: {
    backgroundColor: colors.success.light,
  },
  heroIconCancelled: {
    backgroundColor: colors.neutral[100],
  },
  heroInfo: {
    flex: 1,
    gap: spacing[2],
    paddingTop: spacing[1],
  },
  title: {
    fontWeight: fontWeight.bold,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
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
