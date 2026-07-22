import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "phosphor-react-native";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedView } from "@/shared/ui/themed-view";
import { Input } from "@/shared/ui/input";
import { useAlert } from "@/shared/context/alert-context";
import { extractErrorMessage } from "@/shared/lib/utils/error";
import { Button } from "@/shared/ui/button";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { useChangePassword } from "@/features/user/use-change-password";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useTranslation } from "react-i18next";
import {
  passwordSchema,
  type PasswordFormData,
} from "@/features/user/user.schema";

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { alert } = useAlert();
  const changePasswordMutation = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          alert(
            t("division.success"),
            t("profile.passwordSuccess"),
            [{ text: t("common.ok"), onPress: () => router.back() }],
          );
          reset();
        },
        onError: (error: any) => {
          alert(
            t("division.error"),
            extractErrorMessage(
              error,
              t("profile.passwordError"),
            ),
          );
        },
      },
    );
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedHeader
        title={t("profile.changePassword")}
        withSafeArea={false}
        showBackButton
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.formContainer}>
            <Controller
              control={control}
              name="current_password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("profile.passwordCurrent")}
                  placeholder={t("profile.passwordCurrentPlaceholder")}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.current_password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="new_password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("profile.passwordNew")}
                  placeholder={t("profile.passwordNewPlaceholder")}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.new_password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("profile.passwordConfirm")}
                  placeholder={t("profile.passwordConfirmPlaceholder")}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirm_password?.message}
                />
              )}
            />

            <Button
              title={t("profile.passwordUpdate")}
              onPress={handleSubmit(onSubmit)}
              isLoading={changePasswordMutation.isPending}
              style={styles.submitButton}
            />
          </ThemedView>
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
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  formContainer: {
    gap: 16,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
  },
});
