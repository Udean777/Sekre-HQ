import React, { useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedText } from "@/shared/ui/themed-text";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Select } from "@/shared/ui/select";
import { DatePicker } from "@/shared/ui/date-picker";
import { useAlert } from "@/shared/context/alert-context";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { extractErrorMessage } from "@/shared/lib/utils/error";

import { taskSchema, type TaskFormData } from "@/features/task/task.schema";
import { useTask } from "@/features/task/use-task";
import { useUpdateTask } from "@/features/task/use-update-task";
import { useDeleteTask } from "@/features/task/use-delete-task";
import { useDivisions, useDivision } from "@/features/division/use-divisions";

export default function EditTaskScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { alert } = useAlert();
  const { id } = useLocalSearchParams<{ id: string }>();

  const taskId = id as string;
  const { data: task, isLoading, isError } = useTask(taskId);
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      division_id: "",
      assignee_id: "",
      due_date: "",
    },
  });

  const selectedDivisionId = watch("division_id");

  const { data: divisionsData } = useDivisions();
  const divisionOptions =
    divisionsData?.pages
      .flatMap((page) => page.data)
      .map((div) => ({ label: div.name, value: div.id })) || [];

  const { data: divisionDetails } = useDivision(selectedDivisionId);
  const assigneeOptions =
    (divisionDetails?.members || []).map((m) => ({
      label: m.user.full_name,
      value: m.user.id,
    })) || [];

  useEffect(() => {
    if (task) {
      reset({
        title: task.title || "",
        description: task.description || "",
        division_id: task.division_id || "",
        assignee_id: task.assignee_id || "",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
      });
    }
  }, [task, reset]);

  const onSubmit = (data: TaskFormData) => {
    updateTaskMutation.mutate(
      { id: taskId, data: { ...data, status: task?.status } as any },
      {
        onSuccess: () => {
          alert(t("division.success"), t("tasks.updateSuccess"));
          router.back();
        },
        onError: (error: any) => {
          alert(
            t("division.error"),
            extractErrorMessage(error, t("tasks.updateError")),
          );
        },
      },
    );
  };

  const handleDelete = () => {
    alert(t("tasks.deleteConfirmTitle"), t("tasks.deleteConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("tasks.delete"),
        style: "destructive",
        onPress: () => {
          deleteTaskMutation.mutate(taskId, {
            onSuccess: () => {
              alert(t("division.success"), t("tasks.deleteSuccess"));
              router.back();
            },
            onError: (error: any) => {
              alert(
                t("division.error"),
                extractErrorMessage(error, t("tasks.deleteError")),
              );
            },
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <ThemedSafeAreaView style={styles.container}>
        <ThemedHeader
          title={t("tasks.editTask")}
          withSafeArea={false}
          showBackButton
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </ThemedSafeAreaView>
    );
  }

  if (isError || !task) {
    return (
      <ThemedSafeAreaView style={styles.container}>
        <ThemedHeader
          title={t("tasks.editTask")}
          withSafeArea={false}
          showBackButton
        />
        <View style={styles.centered}>
          <ThemedText>{t("common.errorFallback")}</ThemedText>
        </View>
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedHeader
        title={t("tasks.editTask")}
        withSafeArea={false}
        showBackButton
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedCard style={styles.card}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("tasks.taskTitle")}
                  placeholder={t("tasks.taskTitlePlaceholder")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("tasks.description")}
                  placeholder={t("tasks.descriptionPlaceholder")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
              )}
            />

            <Controller
              control={control}
              name="division_id"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={t("tasks.division")}
                  placeholder={t("tasks.selectDivision")}
                  options={divisionOptions}
                  value={value}
                  onValueChange={(val) => {
                    onChange(val);
                    setValue("assignee_id", "");
                  }}
                  error={errors.division_id?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="assignee_id"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={t("tasks.assignee")}
                  placeholder={t("tasks.selectAssignee")}
                  options={assigneeOptions}
                  value={value}
                  onValueChange={onChange}
                  error={errors.assignee_id?.message}
                  disabled={!selectedDivisionId}
                  emptyMessage={t("tasks.noMembersInDivision")}
                />
              )}
            />

            <Controller
              control={control}
              name="due_date"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label={t("tasks.dueDate")}
                  placeholder="YYYY-MM-DD"
                  onValueChange={onChange}
                  value={value}
                  error={errors.due_date?.message}
                />
              )}
            />

            <Button
              title={t("common.save")}
              onPress={handleSubmit(onSubmit)}
              isLoading={updateTaskMutation.isPending}
              style={styles.saveButton}
            />

            <Button
              title={t("tasks.delete")}
              variant="danger-outline"
              onPress={handleDelete}
              isLoading={deleteTaskMutation.isPending}
              style={styles.deleteButton}
            />
          </ThemedCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 20,
    gap: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 16,
  },
  deleteButton: {
    marginTop: 8,
  },
});
