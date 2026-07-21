import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../lib/hooks/use-theme";
import { ThemedText } from "./themed-text";

export interface ThemedHeaderProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  center?: React.ReactNode;
  withSafeArea?: boolean;
}

export function ThemedHeader({
  title,
  left,
  right,
  center,
  withSafeArea = true,
}: ThemedHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.backgroundElement,
          borderBottomWidth: 1,
        },
        withSafeArea && { paddingTop: insets.top },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>{left}</View>
        <View style={styles.center}>
          {center ? (
            center
          ) : title ? (
            <ThemedText type="smallBold" style={styles.title}>
              {title}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 10,
  },
  content: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  left: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  center: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
  },
});
