import React from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedCard } from "@/shared/ui/themed-card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Select } from "@/shared/ui/select";
import { DatePicker } from "@/shared/ui/date-picker";
import { useAlert } from "@/shared/context/alert-context";
import { extractErrorMessage } from "@/shared/lib/utils/error";

import { taskSchema, type TaskFormData } from "@/features/task/task.schema";
import { useCreateTask } from "@/features/task/use-create-task";
import { useDivisions, useDivision } from "@/features/division/use-divisions";

export default function CreateTaskScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { alert } = useAlert();

  const createTaskMutation = useCreateTask();

  const {
    control,
    handleSubmit,
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
    divisionDetails?.members.map((m) => ({
      label: m.user.full_name,
      value: m.user.id,
    })) || [];

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data, {
      onSuccess: () => {
        alert(t("division.success"), t("tasks.createSuccess"));
        router.back();
      },
      onError: (error: any) => {
        alert(
          t("division.error"),
          extractErrorMessage(error, t("tasks.createError")),
        );
      },
    });
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedHeader
        title={t("tasks.createTask")}
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
              isLoading={createTaskMutation.isPending}
              style={styles.saveButton}
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
});
