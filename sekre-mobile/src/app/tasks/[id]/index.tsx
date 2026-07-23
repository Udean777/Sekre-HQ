import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  CalendarBlank,
  User,
  Users,
  PencilSimple,
} from "phosphor-react-native";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedText } from "@/shared/ui/themed-text";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useTask } from "@/features/task/use-task";
import { formatDate } from "@/shared/lib/utils/date";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { TaskStatus } from "@/shared/types";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const { data: task, isLoading, isError } = useTask(id);

  const statusColors: Record<TaskStatus, string> = {
    TODO: "#3B82F6",
    IN_PROGRESS: "#F59E0B",
    DONE: "#10B981",
  };

  const statusLabels: Record<TaskStatus, string> = {
    TODO: t("tasks.todo"),
    IN_PROGRESS: t("tasks.inProgress"),
    DONE: t("tasks.done"),
  };

  if (isLoading) {
    return (
      <ThemedSafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedSafeAreaView>
    );
  }

  if (isError || !task) {
    return (
      <ThemedSafeAreaView style={styles.center}>
        <ThemedText style={{ color: theme.textSecondary }}>
          Failed to load task details
        </ThemedText>
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedHeader
        title={t("tasks.detail")}
        showBackButton
        withSafeArea={false}
        right={
          <BouncingPressable
            onPress={() => router.push(`/tasks/${task.id}/edit`)}
          >
            <View
              style={[
                styles.editBtn,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <PencilSimple size={18} color={theme.text} />
              <ThemedText style={styles.editBtnText}>
                {t("tasks.edit")}
              </ThemedText>
            </View>
          </BouncingPressable>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[task.status] + "20" },
            ]}
          >
            <ThemedText
              style={[styles.statusText, { color: statusColors[task.status] }]}
            >
              {statusLabels[task.status]}
            </ThemedText>
          </View>

          <ThemedText style={styles.title}>{task.title}</ThemedText>
        </View>

        <View
          style={[
            styles.metaSection,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <View style={styles.metaRow}>
            <View
              style={[
                styles.metaIcon,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <CalendarBlank size={16} color={theme.textSecondary} />
            </View>
            <View style={styles.metaTextContainer}>
              <ThemedText
                style={[styles.metaLabel, { color: theme.textSecondary }]}
              >
                {t("tasks.dueDate")}
              </ThemedText>
              <ThemedText style={styles.metaValue}>
                {task.due_date ? formatDate(task.due_date) : "-"}
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.backgroundSelected },
            ]}
          />

          <View style={styles.metaRow}>
            <View
              style={[
                styles.metaIcon,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <User size={16} color={theme.textSecondary} />
            </View>
            <View style={styles.metaTextContainer}>
              <ThemedText
                style={[styles.metaLabel, { color: theme.textSecondary }]}
              >
                {t("tasks.assignee")}
              </ThemedText>
              <ThemedText style={styles.metaValue}>
                {task.assignee ? task.assignee.full_name : t("tasks.unassigned")}
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.backgroundSelected },
            ]}
          />

          <View style={styles.metaRow}>
            <View
              style={[
                styles.metaIcon,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <Users size={16} color={theme.textSecondary} />
            </View>
            <View style={styles.metaTextContainer}>
              <ThemedText
                style={[styles.metaLabel, { color: theme.textSecondary }]}
              >
                {t("tasks.division")}
              </ThemedText>
              <ThemedText style={styles.metaValue}>
                {task.division ? task.division.name : "-"}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.descSection}>
          <ThemedText style={styles.descTitle}>
            {t("tasks.description")}
          </ThemedText>
          {task.description ? (
            <View
              style={[
                styles.descBox,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <ThemedText style={styles.descText}>
                {task.description}
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={[styles.noDesc, { color: theme.textSecondary }]}>
              {t("tasks.noDescription")}
            </ThemedText>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  metaSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metaTextContainer: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 12,
  },
  descSection: {
    flex: 1,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  descBox: {
    padding: 16,
    borderRadius: 12,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
  },
  noDesc: {
    fontSize: 14,
    fontStyle: "italic",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
