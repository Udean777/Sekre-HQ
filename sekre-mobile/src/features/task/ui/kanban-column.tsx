import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  UIManager,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Plus, X, Check, Buildings, User } from "phosphor-react-native";
import { Task, TaskStatus } from "@/shared/types";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { Button } from "@/shared/ui/button";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useTranslation } from "react-i18next";
import { TaskCard } from "./task-card";
import { useCreateTask } from "../use-create-task";
import { useDivisions, useDivision } from "@/features/division/use-divisions";
import { AssigneeSelectorModal } from "./assignee-selector-modal";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
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

const COLORS: Record<TaskStatus, string> = {
  TODO: "#3B82F6",
  IN_PROGRESS: "#F59E0B",
  DONE: "#10B981",
};

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
  const { t } = useTranslation();
  const accent = COLORS[status];
  const createTask = useCreateTask();

  const [isAdding, setIsAdding] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDivisionId, setFormDivisionId] = useState("");
  const [formAssigneeId, setFormAssigneeId] = useState("");
  const [showDivisionPicker, setShowDivisionPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);

  const { data: divisionsData } = useDivisions();
  const divisionOptions =
    divisionsData?.pages.flatMap((page) => page.data) || [];
  const selectedDivision = divisionOptions.find((d) => d.id === formDivisionId);

  const { data: divisionDetails } = useDivision(formDivisionId);
  const selectedAssignee = (divisionDetails?.members || []).find(
    (m) => m.user.id === formAssigneeId,
  );

  const resetForm = () => {
    setIsAdding(false);
    setFormTitle("");
    setFormDivisionId("");
    setFormAssigneeId("");
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formDivisionId) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    createTask.mutate(
      {
        title: formTitle.trim(),
        division_id: formDivisionId,
        assignee_id: formAssigneeId || undefined,
        status,
        due_date: `${yyyy}-${mm}-${dd}`,
      },
      {
        onSuccess: () => resetForm(),
      },
    );
  };

  const formCard = isAdding ? (
    <View
      style={[
        styles.formCard,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: accent + "30",
        },
      ]}
    >
      <View style={styles.formHeader}>
        <ThemedText style={[styles.formLabel, { color: accent }]}>
          {t("tasks.createTask")}
        </ThemedText>
        <TouchableOpacity onPress={resetForm}>
          <X color={theme.textSecondary} size={18} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.formInput,
          {
            color: theme.text,
            backgroundColor: theme.background,
            borderColor: theme.backgroundSelected,
          },
        ]}
        placeholder="Judul tugas"
        placeholderTextColor={theme.textSecondary}
        value={formTitle}
        onChangeText={setFormTitle}
        autoFocus
      />

      <TouchableOpacity
        style={[
          styles.formRow,
          {
            backgroundColor: theme.background,
            borderColor: theme.backgroundSelected,
          },
        ]}
        onPress={() => setShowDivisionPicker(true)}
      >
        <Buildings color={theme.textSecondary} size={16} />
        <ThemedText
          style={[
            styles.formRowText,
            !selectedDivision && { color: theme.textSecondary, opacity: 0.6 },
          ]}
        >
          {selectedDivision ? selectedDivision.name : t("tasks.selectDivision")}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.formRow,
          {
            backgroundColor: theme.background,
            borderColor: theme.backgroundSelected,
            opacity: formDivisionId ? 1 : 0.5,
          },
        ]}
        onPress={() => formDivisionId && setShowAssigneePicker(true)}
        disabled={!formDivisionId}
      >
        <User color={theme.textSecondary} size={16} />
        <ThemedText
          style={[
            styles.formRowText,
            !selectedAssignee && {
              color: theme.textSecondary,
              opacity: 0.6,
            },
          ]}
        >
          {selectedAssignee
            ? selectedAssignee.user.full_name
            : t("tasks.selectAssignee")}
        </ThemedText>
      </TouchableOpacity>

      <View style={styles.formActions}>
        <Button
          title={t("common.cancel")}
          onPress={resetForm}
          variant="outline-secondary"
          style={styles.formBtn}
        />
        <Button
          title={t("common.save")}
          onPress={handleSave}
          isLoading={createTask.isPending}
          disabled={!formTitle.trim() || !formDivisionId}
          style={styles.formBtn}
        />
      </View>
    </View>
  ) : null;

  return (
    <View
      style={[
        styles.columnCard,
        {
          backgroundColor: accent + "08",
          borderColor: accent + "18",
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={[styles.badge, { backgroundColor: accent + "18" }]}>
          <ThemedText style={[styles.badgeText, { color: accent }]}>
            {tasks.length}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: accent + "18" }]}
          onPress={() => setIsAdding(true)}
        >
          <Plus color={accent} size={16} weight="bold" />
        </TouchableOpacity>
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
        ListHeaderComponent={formCard}
        ListEmptyComponent={
          isAdding ? null : (
            <View style={styles.emptyCol}>
              <ThemedText style={styles.emptyColText}>
                {t("tasks.noTasks")}
              </ThemedText>
            </View>
          )
        }
      />

      <Modal
        visible={showDivisionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDivisionPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowDivisionPicker(false)}
          />
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {t("tasks.selectDivision")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowDivisionPicker(false)}
                style={styles.modalClose}
              >
                <X color={theme.text} size={20} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={divisionOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    {
                      borderBottomColor: theme.backgroundSelected,
                      backgroundColor:
                        item.id === formDivisionId
                          ? accent + "12"
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setFormDivisionId(item.id);
                    setFormAssigneeId("");
                    setShowDivisionPicker(false);
                  }}
                >
                  <Buildings
                    color={
                      item.id === formDivisionId ? accent : theme.textSecondary
                    }
                    size={18}
                  />
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      item.id === formDivisionId && { color: accent },
                    ]}
                  >
                    {item.name}
                  </ThemedText>
                  {item.id === formDivisionId && (
                    <Check color={accent} size={18} weight="bold" />
                  )}
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </View>
      </Modal>

      <AssigneeSelectorModal
        visible={showAssigneePicker}
        divisionId={formDivisionId}
        onClose={() => setShowAssigneePicker(false)}
        onSelect={(memberId) => {
          setFormAssigneeId(memberId || "");
          setShowAssigneePicker(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  columnCard: {
    width: SCREEN_WIDTH * 0.82,
    height: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 12,
  },
  accentBar: {
    height: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 12,
    paddingTop: 4,
  },
  emptyCol: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyColText: {
    fontSize: 13,
    opacity: 0.4,
  },
  formCard: {
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  formInput: {
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  formRowText: {
    fontSize: 14,
    flex: 1,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 2,
  },
  formBtn: {
    minWidth: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  modalContent: {
    borderRadius: 14,
    maxHeight: "60%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalClose: {
    padding: 4,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalItemText: {
    fontSize: 15,
    flex: 1,
  },
});
