import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Task, TaskStatus } from "@/shared/types";
import { KanbanColumn } from "./kanban-column";
import { useUpdateTaskStatus } from "../use-update-task-status";
import { useUpdateTask } from "../use-update-task";
import { LayoutAnimation } from "react-native";
import { AssigneeSelectorModal } from "./assignee-selector-modal";
import { useState } from "react";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLUMN_WIDTH = SCREEN_WIDTH * 0.85;
const SIDE_PADDING = (SCREEN_WIDTH - COLUMN_WIDTH) / 2;

interface KanbanBoardProps {
  tasks: Task[];
  onPressTask: (task: Task) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function KanbanBoard({
  tasks,
  onPressTask,
  isRefreshing,
  onRefresh,
}: KanbanBoardProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const updateStatusMutation = useUpdateTaskStatus();
  const updateTaskMutation = useUpdateTask();

  const [assigneeSelectorTaskId, setAssigneeSelectorTaskId] = useState<string | null>(null);

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const colDefs: { status: TaskStatus; title: string }[] = [
    { status: "TODO", title: t("tasks.todo") },
    { status: "IN_PROGRESS", title: t("tasks.inProgress") },
    { status: "DONE", title: t("tasks.done") },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={COLUMN_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
        }}
        style={styles.scrollView}
      >
        {colDefs.map((col) => {
          const columnTasks = tasks
            .filter((task) => task.status === col.status)
            .sort((a, b) => a.sort_order - b.sort_order);
          return (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              tasks={columnTasks}
              onPressTask={onPressTask}
              onUpdateStatus={handleUpdateStatus}
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              onPressAssignee={(task) => setAssigneeSelectorTaskId(task.id)}
            />
          );
        })}
      </ScrollView>

      <AssigneeSelectorModal
        visible={!!assigneeSelectorTaskId}
        divisionId={tasks.find(t => t.id === assigneeSelectorTaskId)?.division_id}
        onClose={() => setAssigneeSelectorTaskId(null)}
        onSelect={(memberId) => {
          if (assigneeSelectorTaskId) {
            const task = tasks.find(t => t.id === assigneeSelectorTaskId);
            if (task) {
              updateTaskMutation.mutate({
                id: assigneeSelectorTaskId,
                data: { 
                  title: task.title,
                  description: task.description,
                  division_id: task.division_id,
                  due_date: task.due_date,
                  status: task.status,
                  assignee_id: memberId 
                } as any,
              });
            }
          }
          setAssigneeSelectorTaskId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
