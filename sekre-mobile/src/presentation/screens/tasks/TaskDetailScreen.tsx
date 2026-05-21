import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, taskStatusVariant, taskPriorityVariant } from '@presentation/components/Badge';
import { Button } from '@presentation/components/Button';
import { Divider } from '@presentation/components/Divider';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useTaskQuery } from '@hooks/tasks/useTaskQuery';
import { useDeleteTaskMutation } from '@hooks/tasks/useDeleteTaskMutation';
import { useUpdateTaskStatusMutation } from '@hooks/tasks/useUpdateTaskStatusMutation';
import type { TaskStatus, TaskPriority } from '@core/domain/entities/Task';
import type { TasksStackParamList } from '@app/navigation/TasksNavigator';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>;

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

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <AppText variant="bodySm" color={colors.text.secondary} style={styles.infoLabel}>
      {label}
    </AppText>
    <AppText variant="bodyMd" style={styles.infoValue}>
      {value}
    </AppText>
  </View>
);

export const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;

  const { data: task, isLoading, isError } = useTaskQuery(taskId);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTaskStatusMutation();

  const handleEdit = useCallback(() => {
    navigation.navigate('EditTask', { taskId });
  }, [navigation, taskId]);

  const handleDelete = useCallback(() => {
    Alert.alert('Hapus Tugas', 'Apakah Anda yakin ingin menghapus tugas ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteTask(taskId, {
            onSuccess: () => navigation.goBack(),
          });
        },
      },
    ]);
  }, [deleteTask, navigation, taskId]);

  const handleStatusAdvance = useCallback(() => {
    if (!task) return;
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    updateStatus({ id: taskId, status: next });
  }, [task, taskId, updateStatus]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </Screen>
    );
  }

  if (isError || !task) {
    return (
      <Screen padded>
        <AppText variant="bodySm" color={colors.danger.main}>
          Gagal memuat detail tugas.
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

  const nextStatus = NEXT_STATUS[task.status];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title + badges */}
        <View style={styles.titleRow}>
          <AppText variant="h3" style={styles.title}>
            {task.title}
          </AppText>
          <View style={styles.badges}>
            <Badge label={STATUS_LABEL[task.status]} variant={taskStatusVariant(task.status)} />
            <Badge
              label={PRIORITY_LABEL[task.priority]}
              variant={taskPriorityVariant(task.priority)}
            />
          </View>
        </View>

        {/* Description */}
        {task.description ? (
          <Card style={styles.descCard}>
            <AppText variant="label" color={colors.text.secondary}>
              Deskripsi
            </AppText>
            <Divider marginVertical={spacing[2]} />
            <AppText variant="bodyMd">{task.description}</AppText>
          </Card>
        ) : null}

        {/* Detail info */}
        <Card style={styles.infoCard}>
          <AppText variant="label" color={colors.text.secondary}>
            Detail
          </AppText>
          <Divider marginVertical={spacing[2]} />
          <InfoRow label="Penanggung Jawab" value={task.assigneeName ?? 'Belum ditentukan'} />
          <InfoRow label="Divisi" value={task.divisionName ?? 'Belum ditentukan'} />
          <InfoRow
            label="Tenggat"
            value={
              task.dueDate
                ? task.dueDate.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Tidak ada'
            }
          />
          <InfoRow
            label="Dibuat"
            value={task.createdAt.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <InfoRow
            label="Diperbarui"
            value={task.updatedAt.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
        </Card>

        {/* Actions */}
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

          <Button
            label="Edit Tugas"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={handleEdit}
            style={styles.editButton}
          />

          <Button
            label="Hapus Tugas"
            variant="danger"
            size="lg"
            fullWidth
            loading={isDeleting}
            onPress={handleDelete}
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: spacing[3],
  },
  titleRow: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  title: {
    fontWeight: fontWeight.bold,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  descCard: {
    marginBottom: spacing[4],
  },
  infoCard: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing[1],
    gap: spacing[3],
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    flex: 2,
    textAlign: 'right',
    fontWeight: fontWeight.medium,
  },
  actions: {
    gap: spacing[3],
  },
  editButton: {
    marginTop: spacing[1],
  },
  deleteButton: {
    marginTop: spacing[1],
  },
});
