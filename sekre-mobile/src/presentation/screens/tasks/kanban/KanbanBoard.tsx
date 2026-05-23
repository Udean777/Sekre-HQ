import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { spacing } from '@presentation/theme';
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

// ─── Component ────────────────────────────────────────────────────────────────

export const KanbanBoard: React.FC<KanbanBoardProps> = React.memo(
  ({ tasks, onTaskPress, onStatusChange, canManage }) => {
    const dragDrop = useDragDrop();
    const { draggedTaskIdShared, setBoardOffsetY } = dragDrop;

    // Use a ref for scroll offset — avoids re-rendering KanbanBoard on every scroll event.
    // KanbanColumn reads it via the prop only when it needs to re-measure.
    const boardScrollOffsetXRef = useRef(0);
    const [boardScrollOffsetX, setBoardScrollOffsetX] = React.useState(0);

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
    // Throttle state update — only propagate to columns when scroll settles,
    // not on every 16ms frame. Columns re-measure on scroll end.

    const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
      boardScrollOffsetXRef.current = e.nativeEvent.contentOffset.x;
    }, []);

    const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setBoardScrollOffsetX(e.nativeEvent.contentOffset.x);
    }, []);

    // ── Memo-ize tasks per column ─────────────────────────────────────────────
    // Avoids re-filtering on every render when unrelated state changes.

    const tasksByColumn = useMemo(() => {
      const map: Record<TaskStatus, Task[]> = {
        TODO: [],
        IN_PROGRESS: [],
        DONE: [],
        CANCELLED: [],
      };
      for (const task of tasks) {
        map[task.status]?.push(task);
      }
      return map;
    }, [tasks]);

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
            onScrollEndDrag={onScrollEnd}
            onMomentumScrollEnd={onScrollEnd}
            scrollEventThrottle={32}
            decelerationRate="fast"
          >
            {KANBAN_COLUMNS.map((col, index) => (
              <React.Fragment key={col.status}>
                <KanbanColumn
                  config={col}
                  tasks={tasksByColumn[col.status]}
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
  },
);

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
