import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { PlusIcon } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { ThemedText } from "@/shared/ui/themed-text";
import { KanbanBoard } from "@/features/task/ui/kanban-board";
import { useTasks } from "@/features/task/use-tasks";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { Task } from "@/shared/types";

export default function TasksScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const { data: tasks, isLoading, refetch, isRefetching } = useTasks();

  const handlePressTask = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      );
    }

    if (!tasks) {
      return (
        <View style={styles.center}>
          <ThemedText style={{ color: theme.textSecondary }}>
            Failed to load tasks
          </ThemedText>
        </View>
      );
    }

    return (
      <KanbanBoard
        tasks={tasks}
        isRefreshing={isRefetching}
        onRefresh={refetch}
        onPressTask={handlePressTask}
      />
    );
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedHeader title={t("tasks.title")} withSafeArea={false} />

      {renderContent()}

      <BouncingPressable
        style={[styles.fab, { backgroundColor: theme.tint }]}
        onPress={() => router.push("/tasks/create")}
      >
        <PlusIcon color="white" size={24} weight="bold" />
      </BouncingPressable>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
