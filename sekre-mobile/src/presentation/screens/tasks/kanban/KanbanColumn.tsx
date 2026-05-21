import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, radius, fontWeight } from '@presentation/theme';
import type { Task, TaskId, TaskStatus } from '@core/domain/entities/Task';
import { KanbanCard } from './KanbanCard';
import type { UseDragDropReturn } from './useDragDrop';

// ─── Column config ────────────────────────────────────────────────────────────

export interface KanbanColumnConfig {
  status: TaskStatus;
  label: string;
  icon: string;
  color: string;
}

export const KANBAN_COLUMNS: ReadonlyArray<KanbanColumnConfig> = [
  {
    status: 'TODO',
    label: 'Belum Mulai',
    icon: 'ellipse-outline',
    color: colors.neutral[400],
  },
  {
    status: 'IN_PROGRESS',
    label: 'Berjalan',
    icon: 'time-outline',
    color: colors.warning.main,
  },
  {
    status: 'DONE',
    label: 'Selesai',
    icon: 'checkmark-circle',
    color: colors.success.main,
  },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  config: KanbanColumnConfig;
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onDrop: (taskId: TaskId, sourceColumn: TaskStatus, targetColumn: TaskStatus) => void;
  dragDrop: UseDragDropReturn;
  canManage: boolean;
  boardScrollOffsetX: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  config,
  tasks,
  onTaskPress,
  onDrop,
  dragDrop,
  canManage,
  boardScrollOffsetX,
}) => {
  const { isDraggingShared, sourceColumnShared, targetColumnShared, registerColumnLayout } =
    dragDrop;
  const columnRef = useRef<View>(null);

  // ── Register column layout for drop detection ─────────────────────────────

  const measureAndRegister = useCallback(() => {
    columnRef.current?.measureInWindow((x, _y, width) => {
      if (width > 0) {
        registerColumnLayout({ status: config.status, x, width });
      }
    });
  }, [config.status, registerColumnLayout]);

  const onLayout = useCallback(
    (_e: LayoutChangeEvent) => {
      // Small delay to ensure layout is committed before measuring
      setTimeout(measureAndRegister, 50);
    },
    [measureAndRegister],
  );

  // Re-measure when board scrolls (columns shift in screen space)
  useEffect(() => {
    measureAndRegister();
  }, [boardScrollOffsetX, measureAndRegister]);

  // ── Drop zone highlight ───────────────────────────────────────────────────

  const dropZoneStyle = useAnimatedStyle(() => {
    const isTarget =
      isDraggingShared.value &&
      targetColumnShared.value === config.status &&
      sourceColumnShared.value !== config.status;

    return {
      borderColor: withTiming(isTarget ? colors.primary[500] : colors.border.default, {
        duration: 150,
      }),
      backgroundColor: withTiming(isTarget ? colors.primary[50] : colors.surface.background, {
        duration: 150,
      }),
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    const isSource = isDraggingShared.value && sourceColumnShared.value === config.status;
    return {
      opacity: withTiming(isSource ? 0.5 : 1, { duration: 150 }),
    };
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View ref={columnRef} style={styles.container} onLayout={onLayout}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          <Ionicons name={config.icon} size={16} color={config.color} />
          <AppText variant="bodyMd" style={[styles.headerLabel, { color: config.color }]}>
            {config.label}
          </AppText>
        </View>
        <View style={[styles.countBadge, { backgroundColor: config.color + '20' }]}>
          <AppText variant="bodySm" style={[styles.countText, { color: config.color }]}>
            {tasks.length}
          </AppText>
        </View>
      </Animated.View>

      {/* Drop zone */}
      <Animated.View style={[styles.dropZone, dropZoneStyle]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {tasks.length === 0 ? (
            <EmptyColumn status={config.status} dragDrop={dragDrop} />
          ) : (
            tasks.map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                columnStatus={config.status}
                onPress={onTaskPress}
                onDrop={onDrop}
                dragDrop={dragDrop}
                disabled={!canManage}
              />
            ))
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// ─── Empty column placeholder ─────────────────────────────────────────────────

interface EmptyColumnProps {
  status: TaskStatus;
  dragDrop: UseDragDropReturn;
}

const EmptyColumn: React.FC<EmptyColumnProps> = ({ status, dragDrop }) => {
  const { isDraggingShared, targetColumnShared, sourceColumnShared } = dragDrop;

  const style = useAnimatedStyle(() => {
    const isTarget =
      isDraggingShared.value &&
      targetColumnShared.value === status &&
      sourceColumnShared.value !== status;
    return {
      opacity: withTiming(isTarget ? 1 : 0.6, { duration: 150 }),
    };
  });

  return (
    <Animated.View style={[styles.emptyColumn, style]}>
      <Ionicons name="add-circle-outline" size={24} color={colors.neutral[300]} />
      <AppText variant="bodySm" color={colors.text.disabled} style={styles.emptyText}>
        Tidak ada tugas
      </AppText>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: 220,
    flexShrink: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
    paddingHorizontal: spacing[1],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  headerLabel: {
    fontWeight: fontWeight.semiBold,
  },
  countBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontWeight: fontWeight.semiBold,
  },
  dropZone: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[2],
    gap: spacing[2],
    flexGrow: 1,
  },
  emptyColumn: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  emptyText: {
    textAlign: 'center',
  },
});
