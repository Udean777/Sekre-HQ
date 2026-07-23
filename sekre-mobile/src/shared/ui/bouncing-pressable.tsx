import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";

export interface BouncingPressableProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  activeOpacity?: number;
}

export function BouncingPressable({
  children,
  style,
  scaleTo = 0.95,
  activeOpacity = 0.8,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: BouncingPressableProps) {
  const [scale] = useState(() => new Animated.Value(1));

  const handlePressIn = (e: any) => {
    Animated.spring(scale, {
      toValue: scaleTo,
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
        style={({ pressed }) => ({
          opacity: pressed ? activeOpacity : 1,
        })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
