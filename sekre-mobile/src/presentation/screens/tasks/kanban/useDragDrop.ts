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

  // ── Drag origin shared values — used on UI thread during pan ─────────────
  // These are set once at drag start and read on the UI thread in onUpdate,
  // eliminating the need for runOnJS on every pan frame.
  const dragOriginX = useSharedValue(0);
  const dragOriginY = useSharedValue(0);
  const boardOffsetYShared = useSharedValue(0);
  const cardWidthShared = useSharedValue(0);

  // ── Board container offset ────────────────────────────────────────────────
  const boardOffsetY = useRef(0);
  const setBoardOffsetY = useCallback(
    (y: number) => {
      boardOffsetY.current = y;
      boardOffsetYShared.value = y;
    },
    [boardOffsetYShared],
  );

  // ── Column layouts ────────────────────────────────────────────────────────
  const columnLayouts = useRef<ColumnLayout[]>([]);

  const registerColumnLayout = useCallback((layout: ColumnLayout) => {
    columnLayouts.current = [
      ...columnLayouts.current.filter(c => c.status !== layout.status),
      layout,
    ].sort((a, b) => a.x - b.x);
  }, []);

  // Called from UI thread worklet — must only access shared values, not refs
  const getColumnAtX = useCallback((absoluteX: number): TaskStatus | null => {
    for (const col of columnLayouts.current) {
      if (absoluteX >= col.x && absoluteX <= col.x + col.width) {
        return col.status;
      }
    }
    return null;
  }, []);

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

      // Store origin for UI-thread pan updates
      dragOriginX.value = params.cardX;
      dragOriginY.value = params.cardY;
      cardWidthShared.value = params.cardWidth;

      // Position floating card (container-relative)
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
      dragOriginX,
      dragOriginY,
      cardWidthShared,
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

  // ── Update drag position (JS thread fallback) ─────────────────────────────
  // Only used for column detection — position is now updated on UI thread directly.
  const updateTargetColumn = useCallback(
    (absoluteX: number) => {
      const cardCenterX = absoluteX;
      const target = getColumnAtX(cardCenterX);
      if (target && target !== targetColumnRef.current) {
        targetColumnRef.current = target;
        targetColumnShared.value = target;
      }
    },
    [getColumnAtX, targetColumnShared],
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
    // Shared values (UI thread)
    floatingX,
    floatingY,
    floatingOpacity,
    floatingScale,
    isDraggingShared,
    draggedTaskIdShared,
    sourceColumnShared,
    targetColumnShared,
    dragOriginX,
    dragOriginY,
    boardOffsetYShared,
    cardWidthShared,
    // Actions
    registerColumnLayout,
    getColumnAtX,
    startDrag,
    updateTargetColumn,
    endDrag,
    cancelDrag,
    // Getters
    getIsDragging,
    getDraggedTaskId,
    getCardSize,
    setBoardOffsetY,
  };
};

export type UseDragDropReturn = ReturnType<typeof useDragDrop>;
