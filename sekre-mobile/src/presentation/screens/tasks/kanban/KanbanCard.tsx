import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '@presentation/components/Text';
import { Badge, taskPriorityVariant } from '@presentation/components/Badge';
import { colors, spacing, radius, fontWeight } from '@presentation/theme';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { Task, TaskId, TaskStatus } from '@core/domain/entities/Task';
import type { UseDragDropReturn } from './useDragDrop';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  URGENT: 'Mendesak',
};

// Left border accent color per status — subtle visual indicator
const STATUS_ACCENT: Record<TaskStatus, string> = {
  TODO: colors.neutral[300],
  IN_PROGRESS: colors.warning.main,
  DONE: colors.success.main,
  CANCELLED: colors.danger.main,
};

// Card background tint per status
const STATUS_BG: Record<TaskStatus, string> = {
  TODO: colors.surface.card,
  IN_PROGRESS: '#FFFBEB', // warning tint
  DONE: '#F0FDF4', // success tint
  CANCELLED: colors.surface.card,
};

const LONG_PRESS_DURATION = 500;

// ─── Props ────────────────────────────────────────────────────────────────────

interface KanbanCardProps {
  task: Task;
  columnStatus: TaskStatus;
  onPress: (task: Task) => void;
  onDrop: (taskId: TaskId, sourceColumn: TaskStatus, targetColumn: TaskStatus) => void;
  dragDrop: UseDragDropReturn;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  columnStatus,
  onPress,
  onDrop,
  dragDrop,
  disabled = false,
}) => {
  const {
    isDraggingShared,
    draggedTaskIdShared,
    startDrag,
    updateDragPosition,
    endDrag,
    cancelDrag,
  } = dragDrop;

  const cardRef = useRef<View>(null);

  // Captured at long press moment
  const dragStartRef = useRef({
    activated: false,
    cardX: 0,
    cardY: 0,
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLongPressStart = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.measureInWindow((cardX, cardY, cardW, cardH) => {
      dragStartRef.current = {
        activated: true,
        cardX,
        cardY,
      };

      startDrag({
        taskId: task.id as TaskId,
        sourceColumn: columnStatus,
        cardX,
        cardY,
        cardWidth: cardW,
        cardHeight: cardH,
      });
    });
  }, [startDrag, task.id, columnStatus]);

  const handlePanUpdate = useCallback(
    (translationX: number, translationY: number, absoluteX: number) => {
      const ds = dragStartRef.current;
      if (!ds.activated) return;

      // translationX/Y is delta from touch start point.
      // boardOffsetY correction is handled inside useDragDrop.
      updateDragPosition({
        cardX: ds.cardX + translationX,
        cardY: ds.cardY + translationY,
        absoluteX,
      });
    },
    [updateDragPosition],
  );

  const handlePanEnd = useCallback(() => {
    if (!dragStartRef.current.activated) return;
    dragStartRef.current.activated = false;

    const result = endDrag();
    if (
      result.taskId &&
      result.sourceColumn &&
      result.targetColumn &&
      result.sourceColumn !== result.targetColumn
    ) {
      onDrop(result.taskId, result.sourceColumn, result.targetColumn);
    }
  }, [endDrag, onDrop]);

  const handlePanCancel = useCallback(() => {
    if (!dragStartRef.current.activated) return;
    dragStartRef.current.activated = false;
    cancelDrag();
  }, [cancelDrag]);

  const handleTap = useCallback(() => {
    onPress(task);
  }, [onPress, task]);

  // ── Gestures ──────────────────────────────────────────────────────────────
  //
  // LongPress + Pan Simultaneous.
  // Pan events are gated by dragStartRef.activated.
  // onTouchesCancelled handles system interruptions (calls, notifications).

  const longPress = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .onStart(() => {
      'worklet';
      runOnJS(handleLongPressStart)();
    });

  const pan = Gesture.Pan()
    .minDistance(0)
    .onUpdate(e => {
      'worklet';
      runOnJS(handlePanUpdate)(e.translationX, e.translationY, e.absoluteX);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(handlePanEnd)();
    })
    .onTouchesCancelled(() => {
      'worklet';
      runOnJS(handlePanCancel)();
    });

  const gesture = disabled
    ? Gesture.Tap().onEnd(() => {
        'worklet';
        runOnJS(handleTap)();
      })
    : Gesture.Simultaneous(longPress, pan);

  // ── Animated styles ───────────────────────────────────────────────────────

  const animatedStyle = useAnimatedStyle(() => {
    const isThisCardDragging = isDraggingShared.value && draggedTaskIdShared.value === task.id;
    return {
      opacity: withTiming(isThisCardDragging ? 0.2 : 1, { duration: 150 }),
    };
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {/* collapsable=false ensures measureInWindow works reliably on Android */}
        <View ref={cardRef} collapsable={false}>
          <TouchableOpacity onPress={handleTap} activeOpacity={0.75}>
            <CardContent task={task} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

// ─── Card content ─────────────────────────────────────────────────────────────

interface CardContentProps {
  task: Task;
  floating?: boolean;
}

export const CardContent: React.FC<CardContentProps> = ({ task, floating = false }) => (
  <View
    style={[
      styles.card,
      !floating && {
        backgroundColor: STATUS_BG[task.status],
        borderLeftWidth: 3,
        borderLeftColor: STATUS_ACCENT[task.status],
      },
      floating && styles.floatingCard,
    ]}
  >
    <Badge label={PRIORITY_LABEL[task.priority]} variant={taskPriorityVariant(task.priority)} />

    <AppText variant="bodyMd" style={styles.title} numberOfLines={2}>
      {task.title}
    </AppText>

    {task.description ? (
      <AppText
        variant="bodySm"
        color={colors.text.secondary}
        numberOfLines={2}
        style={styles.description}
      >
        {task.description}
      </AppText>
    ) : null}

    <View style={styles.divider} />

    <View style={styles.meta}>
      {task.assigneeName ? (
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={11} color={colors.text.secondary} />
          <AppText
            variant="bodySm"
            color={colors.text.secondary}
            numberOfLines={1}
            style={styles.metaText}
          >
            {task.assigneeName}
          </AppText>
        </View>
      ) : null}

      {task.dueDate ? (
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={11} color={colors.text.secondary} />
          <AppText variant="bodySm" color={colors.text.secondary}>
            {format(task.dueDate, 'd MMM', { locale: localeId })}
          </AppText>
        </View>
      ) : null}
    </View>

    {task.divisionName ? (
      <View style={styles.metaItem}>
        <Ionicons name="business-outline" size={11} color={colors.text.secondary} />
        <AppText
          variant="bodySm"
          color={colors.text.secondary}
          numberOfLines={1}
          style={styles.metaText}
        >
          {task.divisionName}
        </AppText>
      </View>
    ) : null}
  </View>
);

// ─── Floating Clone ───────────────────────────────────────────────────────────

interface FloatingCardProps {
  task: Task;
  dragDrop: UseDragDropReturn;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({ task, dragDrop }) => {
  const { floatingX, floatingY, floatingOpacity, floatingScale, getCardSize } = dragDrop;
  const { width } = getCardSize();

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: floatingX.value,
    top: floatingY.value,
    width: width > 0 ? width : 200,
    opacity: floatingOpacity.value,
    transform: [{ scale: withSpring(floatingScale.value, { damping: 15, stiffness: 200 }) }],
    zIndex: 9999,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  }));

  return (
    <Animated.View style={animatedStyle} pointerEvents="none">
      <CardContent task={task} floating />
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[3],
    gap: spacing[2],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingCard: {
    borderColor: colors.primary[400],
    borderWidth: 1.5,
    backgroundColor: colors.surface.card,
  },
  title: {
    fontWeight: fontWeight.semiBold,
  },
  description: {
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing[1],
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    flex: 1,
  },
});
