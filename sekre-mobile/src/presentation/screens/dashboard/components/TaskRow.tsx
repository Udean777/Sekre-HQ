import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@presentation/components/Text';
import { Badge, taskStatusVariant } from '@presentation/components/Badge';
import { colors, spacing, fontWeight } from '@presentation/theme';
import type { Task, TaskStatus } from '@core/domain/entities/Task';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'Belum Mulai', color: colors.neutral[500] },
  IN_PROGRESS: { label: 'Berjalan', color: colors.info.main },
  DONE: { label: 'Selesai', color: colors.success.main },
  CANCELLED: { label: 'Dibatalkan', color: colors.danger.main },
};

export interface TaskRowProps {
  task: Task;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task }) => (
  <View style={styles.row}>
    <View style={styles.content}>
      <AppText variant="bodyMd" numberOfLines={1} style={styles.title}>
        {task.title}
      </AppText>
      {task.assigneeName ? (
        <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
          {task.assigneeName}
        </AppText>
      ) : null}
    </View>
    <Badge label={STATUS_CONFIG[task.status].label} variant={taskStatusVariant(task.status)} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  content: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    fontWeight: fontWeight.medium,
  },
});
