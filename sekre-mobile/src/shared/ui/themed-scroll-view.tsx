import React from "react";
import { ScrollView, type ScrollViewProps, StyleSheet } from "react-native";
import { useTheme } from "../lib/hooks/use-theme";
import { ThemeColor } from "../config/theme";

export type ThemedScrollViewProps = ScrollViewProps & {
  themeColor?: ThemeColor;
};

export function ThemedScrollView({
  style,
  contentContainerStyle,
  themeColor = "background",
  ...rest
}: ThemedScrollViewProps) {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme[themeColor] }, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
});
