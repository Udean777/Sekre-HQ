import React from "react";
import { SafeAreaView, type ViewProps, StyleSheet } from "react-native";
import { useTheme } from "../lib/hooks/use-theme";
import { ThemeColor } from "../config/theme";

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
