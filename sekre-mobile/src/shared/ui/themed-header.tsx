import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { ThemedText } from "@/shared/ui/themed-text";

import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "phosphor-react-native";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";

export interface ThemedHeaderProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  center?: React.ReactNode;
  withSafeArea?: boolean;
  showBackButton?: boolean;
}

export function ThemedHeader({
  title,
  left,
  right,
  center,
  withSafeArea = true,
  showBackButton = false,
}: ThemedHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const renderLeft = () => {
    if (left) return left;
    if (showBackButton && router.canGoBack()) {
      return (
        <BouncingPressable
          onPress={() => router.back()}
          style={{ padding: 8, marginLeft: -8 }}
        >
          <ArrowLeftIcon color={theme.text} size={24} weight="bold" />
        </BouncingPressable>
      );
    }
    return null;
  };

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
        <View style={styles.left}>{renderLeft()}</View>
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
