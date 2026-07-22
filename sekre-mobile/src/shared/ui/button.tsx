import React, { useRef } from "react";
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  type PressableProps,
} from "react-native";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { ThemedText } from "@/shared/ui/themed-text";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "danger-outline";
  isLoading?: boolean;
  style?: any;
  textStyle?: any;
}

export function Button({
  title,
  variant = "primary",
  isLoading = false,
  style,
  textStyle,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const [scale] = React.useState(() => new Animated.Value(1));

  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundSelected;
    switch (variant) {
      case "primary":
        return theme.tint;
      case "secondary":
        return theme.backgroundElement;
      case "danger":
        return "#ef4444";
      case "outline":
      case "danger-outline":
        return "transparent";
    }
  };

  const getTextColor = () => {
    if (disabled && !variant.includes("outline")) return theme.textSecondary;
    if (disabled && variant.includes("outline")) return theme.textSecondary;

    switch (variant) {
      case "primary":
      case "danger":
        return "#fff"; // White text on colored background typically
      case "secondary":
        return theme.text;
      case "outline":
        return theme.tint;
      case "danger-outline":
        return "#ef4444";
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.backgroundSelected;
    if (variant === "outline") return theme.tint;
    if (variant === "danger-outline") return "#ef4444";
    return "transparent";
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
          <ThemedText
            style={[styles.text, { color: getTextColor() }, textStyle]}
          >
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
