/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/preserve-manual-memoization */
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  CalendarBlank,
  CaretRight,
  CheckCircle,
  Clock,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { Task, TaskStatus } from "@/shared/types";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { formatDate } from "@/shared/lib/utils/date";
import Animated, { LinearTransition } from "react-native-reanimated";

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onPressAssignee?: (task: Task) => void;
}

export function TaskCard({ task, onPress, onUpdateStatus, onPressAssignee }: TaskCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const statusColors: Record<string, string> = {
    TODO: "#3B82F6",
    IN_PROGRESS: "#F59E0B",
    DONE: "#10B981",
  };
  const accentColor = statusColors[task.status] || theme.tint;

  const renderStatusButton = (
    status: TaskStatus,
    label: string,
    icon: React.ReactNode,
  ) => {
    return (
      <TouchableOpacity
        style={[
          styles.statusBtn,
          { backgroundColor: theme.backgroundSelected },
        ]}
        activeOpacity={0.7}
        onPress={() => onUpdateStatus?.(task.id, status)}
      >
        {icon}
        <ThemedText
          style={[styles.statusBtnText, { color: theme.textSecondary }]}
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(15).stiffness(150)}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(task)}>
        <ThemedCard style={[styles.card, { borderLeftColor: accentColor }]}>
          <View style={styles.header}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {task.title}
            </ThemedText>
            {task.due_date && (
              <View style={styles.dateContainer}>
                <CalendarBlank size={12} color={theme.textSecondary} />
                <ThemedText
                  style={[styles.date, { color: theme.textSecondary }]}
                >
                  {formatDate(task.due_date)}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              activeOpacity={0.6} 
              onPress={() => onPressAssignee?.(task)}
              style={styles.assigneeWrapper}
            >
              <ThemedText style={[styles.assignee, { color: theme.tint }]} numberOfLines={1}>
                {task.assignee ? t("tasks.assignee") + ": " + task.assignee.full_name : t("tasks.unassigned")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            {task.status !== "TODO" &&
              renderStatusButton(
                "TODO",
                t("tasks.todo"),
                <Clock size={12} color={theme.textSecondary} />,
              )}
            {task.status !== "IN_PROGRESS" &&
              renderStatusButton(
                "IN_PROGRESS",
                t("tasks.inProgress"),
                <CaretRight size={12} color={theme.textSecondary} />,
              )}
            {task.status !== "DONE" &&
              renderStatusButton(
                "DONE",
                t("tasks.done"),
                <CheckCircle size={12} color={theme.textSecondary} />,
              )}
          </View>
        </ThemedCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  date: {
    fontSize: 10,
  },
  footer: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  assigneeWrapper: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  assignee: {
    fontSize: 11,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
  },
  statusBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusBtnText: {
    fontSize: 10,
    fontWeight: "500",
  },
});
