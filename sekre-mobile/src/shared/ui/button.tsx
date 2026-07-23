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
  variant?: "primary" | "secondary" | "outline" | "outline-secondary" | "danger" | "danger-outline" | "success";
  size?: "small" | "default" | "large";
  isLoading?: boolean;
  style?: any;
  textStyle?: any;
}

export function Button({
  title,
  variant = "primary",
  size = "default",
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
      case "success":
        return "#22c55e";
      case "outline":
      case "outline-secondary":
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
      case "success":
        return "#fff"; // White text on colored background typically
      case "secondary":
        return theme.text;
      case "outline":
        return theme.tint;
      case "outline-secondary":
        return theme.textSecondary;
      case "danger-outline":
        return "#ef4444";
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.backgroundSelected;
    if (variant === "outline") return theme.tint;
    if (variant === "outline-secondary") return theme.backgroundSelected;
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
          size === "small" && styles.containerSmall,
          size === "large" && styles.containerLarge,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant.includes("outline") ? 1 : 0,
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
            style={[
              styles.text, 
              size === "small" && styles.textSmall,
              size === "large" && styles.textLarge,
              { color: getTextColor() }, 
              textStyle
            ]}
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
  containerSmall: {
    height: 36,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 6,
  },
  containerLarge: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  textSmall: {
    fontSize: 14,
    fontWeight: "500",
  },
  textLarge: {
    fontSize: 18,
    fontWeight: "700",
  },
});
