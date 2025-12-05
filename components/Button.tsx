import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, ActivityIndicator, TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Colors } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "text";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = "primary",
  icon,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return Colors.light.primary;
      case "secondary":
        return Colors.light.backgroundSecondary;
      case "outline":
        return "transparent";
      case "text":
        return "transparent";
      default:
        return Colors.light.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return Colors.light.buttonText;
      case "secondary":
        return Colors.light.text;
      case "outline":
        return Colors.light.primary;
      case "text":
        return Colors.light.link;
      default:
        return Colors.light.buttonText;
    }
  };

  const getBorderStyle = () => {
    if (variant === "outline") {
      return {
        borderWidth: 2,
        borderColor: Colors.light.primary,
      };
    }
    return {};
  };

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
        getBorderStyle(),
        variant === "text" && styles.textButton,
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: getTextColor() }, icon ? styles.textWithIcon : null, textStyle]}
          >
            {children}
          </ThemedText>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
  },
  textButton: {
    height: "auto",
    paddingHorizontal: 0,
    paddingVertical: Spacing.sm,
  },
  buttonText: {
    fontWeight: "600",
  },
  textWithIcon: {
    marginLeft: Spacing.sm,
  },
});
