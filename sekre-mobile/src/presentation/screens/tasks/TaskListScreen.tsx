import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, taskStatusVariant } from '@presentation/components/Badge';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useTasksQuery } from '@hooks/tasks/useTasksQuery';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { useAppSelector } from '@store/hooks';
import type { Task, TaskStatus } from '@core/domain/entities/Task';
import type { TasksStackParamList } from '@app/navigation/TasksNavigator';
import type { DivisionId } from '@core/domain/entities/Division';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskList'>;

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  divisionName: string | null;
  onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, divisionName, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Card style={styles.taskCard}>
      <View style={styles.cardHeader}>
        {/* Icon */}
        <View style={styles.taskIcon}>
          <Ionicons
            name={task.status === 'DONE' ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={task.status === 'DONE' ? colors.success.main : colors.neutral[400]}
          />
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <AppText variant="bodyMd" style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </AppText>
          {divisionName ? (
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={12} color={colors.text.secondary} />
              <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
                {divisionName}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Badge label={STATUS_LABEL[task.status]} variant={taskStatusVariant(task.status)} />
        <View style={styles.metaRow}>
          {task.assigneeName ? (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={12} color={colors.text.secondary} />
              <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
                {task.assigneeName}
              </AppText>
            </View>
          ) : null}
          {task.dueDate ? (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={colors.text.secondary} />
              <AppText variant="bodySm" color={colors.text.secondary}>
                {task.dueDate.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<TaskStatus | undefined>(undefined);

  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useTasksQuery({
    status: activeStatus,
    search: search.trim() || undefined,
    limit: 50,
  });

  const { data: divisionsData } = useDivisionsQuery({ limit: 100 });

  const getDivisionName = useCallback(
    (divisionId: string | null): string | null => {
      if (!divisionId || !divisionsData) return null;
      return divisionsData.divisions.find(d => d.id === (divisionId as DivisionId))?.name ?? null;
    },
    [divisionsData],
  );

  const handleTaskPress = useCallback(
    (task: Task) => navigation.navigate('TaskDetail', { taskId: task.id }),
    [navigation],
  );

  const handleCreate = useCallback(() => navigation.navigate('CreateTask'), [navigation]);

  const renderTask = useCallback(
    ({ item }: { item: Task }) => (
      <TaskCard
        task={item}
        onPress={() => handleTaskPress(item)}
        divisionName={getDivisionName(item.divisionId)}
      />
    ),
    [handleTaskPress, getDivisionName],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  return (
    <Screen padded edges={['top']} tabScreen>
      {/* ── Header ── */}
      <View style={styles.header}>
        <AppText variant="h3">Tugas</AppText>
        {canManage ? (
          <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      {/* ── Search ── */}
      <Input
        placeholder="Cari tugas..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* ── Status filter ── */}
      <View style={styles.filterRow}>
        {STATUS_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value ?? 'all'}
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

      {/* ── Total ── */}
      {!isLoading && !isError && data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.tasks.length} tugas ditemukan
        </AppText>
      ) : null}

      {/* ── List ── */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : isError ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger.main} />
          <AppText variant="bodySm" color={colors.danger.main} style={styles.errorText}>
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
              icon="checkmark-circle-outline"
              title="Belum ada tugas"
              description="Buat tugas pertama untuk mulai melacak pekerjaan tim."
              actionLabel={canManage ? '+ Buat Tugas' : undefined}
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
    marginBottom: spacing[3],
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginVertical: spacing[2],
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
  taskCard: {
    gap: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  taskIcon: {
    marginTop: 2,
  },
  cardInfo: {
    flex: 1,
    gap: spacing[1],
  },
  taskTitle: {
    fontWeight: fontWeight.semiBold,
  },
  taskDescription: {
    marginTop: spacing[1],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
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
