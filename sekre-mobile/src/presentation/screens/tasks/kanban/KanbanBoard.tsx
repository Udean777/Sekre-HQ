import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { colors, spacing } from '@presentation/theme';
import type { Task, TaskId, TaskStatus } from '@core/domain/entities/Task';
import { KanbanColumn, KANBAN_COLUMNS } from './KanbanColumn';
import { FloatingCard } from './KanbanCard';
import { useDragDrop } from './useDragDrop';

// ─── Props ────────────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onStatusChange: (taskId: TaskId, newStatus: TaskStatus) => void;
  canManage: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTasksForColumn = (tasks: Task[], status: TaskStatus): Task[] =>
  tasks.filter(t => t.status === status);

// ─── Component ────────────────────────────────────────────────────────────────

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskPress,
  onStatusChange,
  canManage,
}) => {
  const dragDrop = useDragDrop();
  const { draggedTaskIdShared, setBoardOffsetY } = dragDrop;

  const [boardScrollOffsetX, setBoardScrollOffsetX] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const boardWrapperRef = useRef<View>(null);

  // ── Floating card task ────────────────────────────────────────────────────
  const [floatingTask, setFloatingTask] = React.useState<Task | null>(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const syncFloatingTask = useCallback((taskId: string) => {
    if (!taskId) {
      setFloatingTask(null);
      return;
    }
    const found = tasksRef.current.find(t => t.id === taskId) ?? null;
    setFloatingTask(found);
  }, []);

  // Listen to shared value changes on UI thread, sync to React state via runOnJS
  useAnimatedReaction(
    () => draggedTaskIdShared.value,
    (current, previous) => {
      if (current !== previous) {
        runOnJS(syncFloatingTask)(current);
      }
    },
    [syncFloatingTask],
  );

  // ── Handle drop ───────────────────────────────────────────────────────────

  const handleDrop = useCallback(
    (taskId: TaskId, _sourceColumn: TaskStatus, targetColumn: TaskStatus) => {
      onStatusChange(taskId, targetColumn);
    },
    [onStatusChange],
  );

  // ── Board scroll ──────────────────────────────────────────────────────────

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setBoardScrollOffsetX(e.nativeEvent.contentOffset.x);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <View
        ref={boardWrapperRef}
        style={styles.boardWrapper}
        onLayout={() => {
          boardWrapperRef.current?.measureInWindow((_x, y) => {
            setBoardOffsetY(y);
          });
        }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.boardContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          {KANBAN_COLUMNS.map((col, index) => (
            <React.Fragment key={col.status}>
              <KanbanColumn
                config={col}
                tasks={getTasksForColumn(tasks, col.status)}
                onTaskPress={onTaskPress}
                onDrop={handleDrop}
                dragDrop={dragDrop}
                canManage={canManage}
                boardScrollOffsetX={boardScrollOffsetX}
              />
              {index < KANBAN_COLUMNS.length - 1 ? <View style={styles.columnSeparator} /> : null}
            </React.Fragment>
          ))}
        </ScrollView>

        {/* Floating drag clone — absolute overlay above board */}
        {floatingTask ? <FloatingCard task={floatingTask} dragDrop={dragDrop} /> : null}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boardWrapper: {
    flex: 1,
    position: 'relative',
  },
  boardContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    paddingBottom: spacing[6],
    alignItems: 'stretch',
  },
  columnSeparator: {
    width: spacing[3],
  },
});
