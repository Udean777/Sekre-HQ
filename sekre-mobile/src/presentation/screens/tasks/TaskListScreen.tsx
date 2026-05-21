import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, taskStatusVariant, taskPriorityVariant } from '@presentation/components/Badge';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing, fontWeight, fontSize } from '@presentation/theme';
import { useTasksQuery } from '@hooks/tasks/useTasksQuery';
import type { Task, TaskStatus, TaskPriority } from '@core/domain/entities/Task';
import type { TasksStackParamList } from '@app/navigation/TasksNavigator';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskList'>;

const STATUS_OPTIONS: Array<{ label: string; value: TaskStatus | undefined }> = [
  { label: 'Semua', value: undefined },
  { label: 'Belum Mulai', value: 'TODO' },
  { label: 'Berjalan', value: 'IN_PROGRESS' },
  { label: 'Selesai', value: 'DONE' },
  { label: 'Batal', value: 'CANCELLED' },
];

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Belum Mulai',
  IN_PROGRESS: 'Berjalan',
  DONE: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  URGENT: 'Mendesak',
};

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Card style={styles.taskCard}>
      <View style={styles.taskCardHeader}>
        <AppText variant="bodyMd" style={styles.taskTitle} numberOfLines={2}>
          {task.title}
        </AppText>
        <Badge label={PRIORITY_LABEL[task.priority]} variant={taskPriorityVariant(task.priority)} />
      </View>

      {task.description ? (
        <AppText
          variant="bodySm"
          color={colors.text.secondary}
          numberOfLines={2}
          style={styles.taskDescription}
        >
          {task.description}
        </AppText>
      ) : null}

      <View style={styles.taskCardFooter}>
        <Badge label={STATUS_LABEL[task.status]} variant={taskStatusVariant(task.status)} />
        <View style={styles.taskMeta}>
          {task.assigneeName ? (
            <AppText variant="bodySm" color={colors.text.secondary}>
              {task.assigneeName}
            </AppText>
          ) : null}
          {task.dueDate ? (
            <AppText variant="bodySm" color={colors.text.secondary}>
              {task.dueDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              })}
            </AppText>
          ) : null}
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<TaskStatus | undefined>(undefined);

  const { data, isLoading, isError, refetch, isFetching } = useTasksQuery({
    status: activeStatus,
    search: search.trim() || undefined,
    limit: 50,
  });

  const handleTaskPress = useCallback(
    (task: Task) => {
      navigation.navigate('TaskDetail', { taskId: task.id });
    },
    [navigation],
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreateTask');
  }, [navigation]);

  const renderTask = useCallback(
    ({ item }: { item: Task }) => <TaskCard task={item} onPress={() => handleTaskPress(item)} />,
    [handleTaskPress],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  return (
    <Screen padded>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h3">Tugas</AppText>
        <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreatePress} />
      </View>

      {/* Search */}
      <Input
        placeholder="Cari tugas..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* Status filter */}
      <View style={styles.filterRow}>
        {STATUS_OPTIONS.map(opt => (
          <TouchableOpacity
            key={String(opt.value)}
            onPress={() => setActiveStatus(opt.value)}
            style={[styles.filterChip, activeStatus === opt.value && styles.filterChipActive]}
            activeOpacity={0.7}
          >
            <AppText
              variant="bodySm"
              color={activeStatus === opt.value ? colors.text.inverse : colors.text.secondary}
            >
              {opt.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : isError ? (
        <View style={styles.centered}>
          <AppText variant="bodySm" color={colors.danger.main}>
            Gagal memuat tugas.
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
          data={data?.tasks ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderTask}
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
              icon="📋"
              title="Belum ada tugas"
              description="Buat tugas pertama untuk mulai melacak pekerjaan tim."
              actionLabel="+ Buat Tugas"
              onAction={handleCreatePress}
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
  searchInput: {
    marginBottom: spacing[3],
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  listContent: {
    gap: spacing[3],
    paddingBottom: spacing[6],
  },
  taskCard: {
    gap: spacing[2],
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  taskTitle: {
    flex: 1,
    fontWeight: fontWeight.semiBold,
  },
  taskDescription: {
    marginTop: spacing[1],
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  taskMeta: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  retryButton: {
    marginTop: spacing[2],
  },
  statCount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
});
