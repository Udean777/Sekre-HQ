import React from "react";
import { type ViewProps, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { ThemeColor } from "@/shared/config/theme";

export type ThemedSafeAreaViewProps = ViewProps & {
  themeColor?: ThemeColor;
};

export function ThemedSafeAreaView({
  style,
  themeColor = "background",
  ...rest
}: ThemedSafeAreaViewProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme[themeColor] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
