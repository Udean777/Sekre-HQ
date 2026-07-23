import React from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  Platform,
} from "react-native";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { ThemedText } from "@/shared/ui/themed-text";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  style,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? "red" : theme.backgroundSelected,
            backgroundColor: theme.backgroundElement,
          },
          style,
        ]}
      >
        {leftIcon}
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.textSecondary}
          {...props}
        />
        {rightIcon}
      </View>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    minHeight: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingVertical: Platform.OS === "android" ? 0 : undefined,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
