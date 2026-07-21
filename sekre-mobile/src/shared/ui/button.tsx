import React, { useRef } from "react";
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  type PressableProps,
} from "react-native";
import { useTheme } from "../lib/hooks/use-theme";
import { ThemedText } from "./themed-text";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
  style?: any;
}

export function Button({
  title,
  variant = "primary",
  isLoading = false,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundSelected;
    switch (variant) {
      case "primary":
        return theme.tint;
      case "secondary":
        return theme.backgroundElement;
      case "outline":
        return "transparent";
    }
  };

  const getTextColor = () => {
    if (disabled && variant !== "outline") return theme.textSecondary;
    if (disabled && variant === "outline") return theme.textSecondary;

    switch (variant) {
      case "primary":
        return "#fff"; // White text on colored background typically
      case "secondary":
        return theme.text;
      case "outline":
        return theme.tint;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.backgroundSelected;
    return variant === "outline" ? theme.tint : "transparent";
  };

  const handlePressIn = (e: any) => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant === "outline" ? 1 : 0,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        disabled={disabled || isLoading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <ThemedText style={[styles.text, { color: getTextColor() }]}>
            {title}
          </ThemedText>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
