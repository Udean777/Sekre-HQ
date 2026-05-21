import { useCallback, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { TaskId, TaskStatus } from '@core/domain/entities/Task';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnLayout {
  x: number;
  width: number;
  status: TaskStatus;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useDragDrop = () => {
  // ── Drag state in refs — no re-render on pan update ───────────────────────
  const isDraggingRef = useRef(false);
  const draggedTaskIdRef = useRef<TaskId | null>(null);
  const sourceColumnRef = useRef<TaskStatus | null>(null);
  const targetColumnRef = useRef<TaskStatus | null>(null);
  const cardWidthRef = useRef(0);
  const cardHeightRef = useRef(0);

  // ── Shared values — drive animated UI on UI thread ────────────────────────
  const floatingX = useSharedValue(0);
  const floatingY = useSharedValue(0);
  const floatingOpacity = useSharedValue(0);
  const floatingScale = useSharedValue(1);
  const isDraggingShared = useSharedValue(false);
  const draggedTaskIdShared = useSharedValue('');
  const sourceColumnShared = useSharedValue('');
  const targetColumnShared = useSharedValue('');

  // ── Board container offset ────────────────────────────────────────────────
  // boardOffsetY = Y position of boardWrapper relative to screen top.
  // Used to convert screen-absolute cardY (from measureInWindow) to
  // container-relative Y for FloatingCard (which is absolute inside boardWrapper).
  const boardOffsetY = useRef(0);
  const setBoardOffsetY = useCallback((y: number) => {
    boardOffsetY.current = y;
  }, []);

  // ── Column layouts ────────────────────────────────────────────────────────
  const columnLayouts = useRef<ColumnLayout[]>([]);

  const registerColumnLayout = useCallback((layout: ColumnLayout) => {
    columnLayouts.current = [
      ...columnLayouts.current.filter(c => c.status !== layout.status),
      layout,
    ].sort((a, b) => a.x - b.x);
  }, []);

  const getColumnAtX = useCallback((absoluteX: number): TaskStatus | null => {
    for (const col of columnLayouts.current) {
      if (absoluteX >= col.x && absoluteX <= col.x + col.width) {
        return col.status;
      }
    }
    return null;
  }, []);

  // ── Start drag ────────────────────────────────────────────────────────────
  // ── Start drag ────────────────────────────────────────────────────────────
  const startDrag = useCallback(
    (params: {
      taskId: TaskId;
      sourceColumn: TaskStatus;
      cardX: number;
      cardY: number;
      cardWidth: number;
      cardHeight: number;
    }) => {
      isDraggingRef.current = true;
      draggedTaskIdRef.current = params.taskId;
      sourceColumnRef.current = params.sourceColumn;
      targetColumnRef.current = params.sourceColumn;
      cardWidthRef.current = params.cardWidth;
      cardHeightRef.current = params.cardHeight;

      // Convert screen-absolute cardX/Y to container-relative for FloatingCard
      // (FloatingCard is absolute inside boardWrapper, not screen root)
      floatingX.value = params.cardX;
      floatingY.value = params.cardY - boardOffsetY.current;
      floatingOpacity.value = 1;
      floatingScale.value = 1.05;

      isDraggingShared.value = true;
      draggedTaskIdShared.value = params.taskId;
      sourceColumnShared.value = params.sourceColumn;
      targetColumnShared.value = params.sourceColumn;
    },
    [
      floatingX,
      floatingY,
      floatingOpacity,
      floatingScale,
      isDraggingShared,
      draggedTaskIdShared,
      sourceColumnShared,
      targetColumnShared,
    ],
  );

  // ── Update drag position ──────────────────────────────────────────────────
  // cardX/Y: new floating card top-left position (computed from translationX/Y in KanbanCard)
  // absoluteX: finger absolute X for column detection
  const updateDragPosition = useCallback(
    (params: { cardX: number; cardY: number; absoluteX: number }) => {
      floatingX.value = params.cardX;
      floatingY.value = params.cardY - boardOffsetY.current;

      // Detect target column using card center X
      const cardCenterX = params.cardX + cardWidthRef.current / 2;
      const target = getColumnAtX(cardCenterX);
      if (target && target !== targetColumnRef.current) {
        targetColumnRef.current = target;
        targetColumnShared.value = target;
      }
    },
    [floatingX, floatingY, getColumnAtX, targetColumnShared],
  );

  // ── End drag ──────────────────────────────────────────────────────────────
  const endDrag = useCallback((): {
    taskId: TaskId | null;
    sourceColumn: TaskStatus | null;
    targetColumn: TaskStatus | null;
  } => {
    const result = {
      taskId: draggedTaskIdRef.current,
      sourceColumn: sourceColumnRef.current,
      targetColumn: targetColumnRef.current,
    };

    isDraggingRef.current = false;
    draggedTaskIdRef.current = null;
    sourceColumnRef.current = null;
    targetColumnRef.current = null;
    floatingOpacity.value = 0;
    floatingScale.value = 1;
    isDraggingShared.value = false;
    draggedTaskIdShared.value = '';
    sourceColumnShared.value = '';
    targetColumnShared.value = '';

    return result;
  }, [
    floatingOpacity,
    floatingScale,
    isDraggingShared,
    draggedTaskIdShared,
    sourceColumnShared,
    targetColumnShared,
  ]);

  // ── Cancel drag ───────────────────────────────────────────────────────────
  const cancelDrag = useCallback(() => {
    isDraggingRef.current = false;
    draggedTaskIdRef.current = null;
    sourceColumnRef.current = null;
    targetColumnRef.current = null;
    floatingOpacity.value = 0;
    floatingScale.value = 1;
    isDraggingShared.value = false;
    draggedTaskIdShared.value = '';
    sourceColumnShared.value = '';
    targetColumnShared.value = '';
  }, [
    floatingOpacity,
    floatingScale,
    isDraggingShared,
    draggedTaskIdShared,
    sourceColumnShared,
    targetColumnShared,
  ]);

  // ── Getters ───────────────────────────────────────────────────────────────
  const getIsDragging = useCallback(() => isDraggingRef.current, []);
  const getDraggedTaskId = useCallback(() => draggedTaskIdRef.current, []);
  const getCardSize = useCallback(
    () => ({ width: cardWidthRef.current, height: cardHeightRef.current }),
    [],
  );

  return {
    floatingX,
    floatingY,
    floatingOpacity,
    floatingScale,
    isDraggingShared,
    draggedTaskIdShared,
    sourceColumnShared,
    targetColumnShared,
    registerColumnLayout,
    getColumnAtX,
    startDrag,
    updateDragPosition,
    endDrag,
    cancelDrag,
    getIsDragging,
    getDraggedTaskId,
    getCardSize,
    setBoardOffsetY,
  };
};

export type UseDragDropReturn = ReturnType<typeof useDragDrop>;
