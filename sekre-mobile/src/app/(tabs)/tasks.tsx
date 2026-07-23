import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { PlusIcon, ClipboardText } from "phosphor-react-native";
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
          <ClipboardText color={theme.textSecondary} size={48} weight="thin" />
          <ThemedText style={styles.errorText}>Gagal memuat tugas</ThemedText>
          <BouncingPressable
            style={[styles.retryBtn, { backgroundColor: theme.tint }]}
            onPress={() => refetch()}
          >
            <ThemedText style={styles.retryText}>Coba lagi</ThemedText>
          </BouncingPressable>
        </View>
      );
    }

    if (tasks.length === 0) {
      return (
        <View style={styles.center}>
          <ClipboardText color={theme.textSecondary} size={64} weight="thin" />
          <ThemedText style={styles.emptyTitle}>Belum ada tugas</ThemedText>
          <ThemedText style={styles.emptyHint}>
            Buat tugas pertama untuk mulai mengelola pekerjaan
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
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.7,
    marginTop: 4,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.45,
    lineHeight: 20,
    paddingHorizontal: 20,
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
