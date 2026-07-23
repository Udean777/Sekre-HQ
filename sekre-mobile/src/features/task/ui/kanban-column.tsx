import React from "react";
import { View, StyleSheet, Dimensions, Platform, UIManager } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Task, TaskStatus } from "@/shared/types";
import { ThemedText } from "@/shared/ui/themed-text";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { TaskCard } from "./task-card";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_WIDTH = Dimensions.get("window").width;

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onPressTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onPressAssignee?: (task: Task) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function KanbanColumn({
  status,
  title,
  tasks,
  onPressTask,
  onUpdateStatus,
  onPressAssignee,
  isRefreshing,
  onRefresh,
}: KanbanColumnProps) {
  const theme = useTheme();

  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.backgroundSelected },
          ]}
        >
          <ThemedText style={styles.badgeText}>{tasks.length}</ThemedText>
        </View>
      </View>

      <FlashList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard 
             task={item} 
             onPress={onPressTask} 
             onUpdateStatus={onUpdateStatus}
             onPressAssignee={onPressAssignee}
          />
        )}
        // @ts-expect-error Type mismatch with older @shopify/flash-list typings
        estimatedItemSize={120}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: SCREEN_WIDTH * 0.85,
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
});
