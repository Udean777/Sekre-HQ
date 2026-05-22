import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useTasksQuery } from '@hooks/tasks/useTasksQuery';
import { useUpdateTaskStatusMutation } from '@hooks/tasks/useUpdateTaskStatusMutation';
import { useAppSelector } from '@store/hooks';
import type { Task, TaskId, TaskStatus } from '@core/domain/entities/Task';
import type { TasksStackParamList } from '@app/navigation/TasksNavigator';
import { KanbanBoard } from './kanban/KanbanBoard';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskList'>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useTasksQuery({
    search: search.trim() || undefined,
    limit: 100,
  });

  const { mutate: updateStatus } = useUpdateTaskStatusMutation();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTaskPress = useCallback(
    (task: Task) => navigation.navigate('TaskDetail', { taskId: task.id }),
    [navigation],
  );

  const handleCreate = useCallback(() => navigation.navigate('CreateTask'), [navigation]);

  const handleStatusChange = useCallback(
    (taskId: TaskId, newStatus: TaskStatus) => {
      updateStatus({ id: taskId, status: newStatus });
    },
    [updateStatus],
  );

  // ── Render states ─────────────────────────────────────────────────────────

  const renderContent = useCallback(() => {
    if (isLoading) {
      return <SkeletonList count={5} />;
    }

    if (isError) {
      return (
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
      );
    }

    return (
      <KanbanBoard
        tasks={data?.tasks ?? []}
        onTaskPress={handleTaskPress}
        onStatusChange={handleStatusChange}
        canManage={canManage}
      />
    );
  }, [isLoading, isError, data, refetch, handleTaskPress, handleStatusChange, canManage]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Screen padded={false} edges={['top']} tabScreen>
      {/* ── Header ── */}
      <View style={styles.header}>
        <AppText variant="h3">Tugas</AppText>
        {canManage ? (
          <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrapper}>
        <Input placeholder="Cari tugas..." value={search} onChangeText={setSearch} />
      </View>

      {/* ── Pull to refresh wrapper ── */}
      {!isLoading && !isError ? (
        <ScrollView
          style={styles.refreshWrapper}
          contentContainerStyle={styles.refreshContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => void refetch()}
              tintColor={colors.primary[500]}
            />
          }
          scrollEnabled={false}
        >
          {renderContent()}
        </ScrollView>
      ) : (
        <View style={styles.stateWrapper}>{renderContent()}</View>
      )}
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
    paddingBottom: spacing[3],
  },
  refreshWrapper: {
    flex: 1,
  },
  refreshContent: {
    flex: 1,
  },
  stateWrapper: {
    flex: 1,
  },

  // Error state
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
