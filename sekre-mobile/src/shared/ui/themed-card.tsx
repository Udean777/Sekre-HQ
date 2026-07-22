import React from "react";
import { View, ViewProps, StyleSheet, Platform } from "react-native";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { ThemeColor } from "@/shared/config/theme";

export type ThemedCardProps = ViewProps & {
  themeColor?: ThemeColor;
};

export function ThemedCard({
  style,
  themeColor = "backgroundElement",
  ...rest
}: ThemedCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme[themeColor] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
