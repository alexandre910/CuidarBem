import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

type CareType = "medicamento" | "refeicao" | "consulta" | "exercicio";

interface CareCardProps {
  type: CareType;
  title: string;
  subtitle?: string;
  details?: string[];
  onPress?: () => void;
  onDelete?: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const typeConfig: Record<CareType, { color: string; icon: keyof typeof Feather.glyphMap }> = {
  medicamento: { color: Colors.light.accent1, icon: "activity" },
  refeicao: { color: Colors.light.primary, icon: "coffee" },
  consulta: { color: Colors.light.accent2, icon: "calendar" },
  exercicio: { color: Colors.light.accent1, icon: "heart" },
};

export function CareCard({
  type,
  title,
  subtitle,
  details,
  onPress,
  onDelete,
}: CareCardProps) {
  const scale = useSharedValue(1);
  const config = typeConfig[type];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      <View style={[styles.colorBar, { backgroundColor: config.color }]} />
      <View style={styles.iconContainer}>
        <Feather name={config.icon} size={24} color={config.color} />
      </View>
      <View style={styles.content}>
        <ThemedText type="body" style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
        {details && details.length > 0 ? (
          <View style={styles.details}>
            {details.map((detail, index) => (
              <ThemedText key={index} type="caption" style={styles.detail}>
                {detail}
              </ThemedText>
            ))}
          </View>
        ) : null}
      </View>
      {onDelete ? (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={18} color={Colors.light.error} />
        </Pressable>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.light.backgroundDefault,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  colorBar: {
    width: 4,
  },
  iconContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: Spacing.md,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  title: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: "#666666",
    marginBottom: Spacing.xs,
  },
  details: {
    marginTop: Spacing.xs,
  },
  detail: {
    color: "#666666",
    marginBottom: 2,
  },
  deleteButton: {
    padding: Spacing.md,
    justifyContent: "center",
  },
});
