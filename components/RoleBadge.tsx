import React from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { UserRole, RoleLabels, RoleColors } from "@/constants/theme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface RoleBadgeProps {
  role: UserRole;
  style?: StyleProp<ViewStyle>;
  size?: "small" | "medium";
}

export function RoleBadge({ role, style, size = "small" }: RoleBadgeProps) {
  const backgroundColor = RoleColors[role];
  const textColor = role === "enfermeiro" || role === "empresa" || role === "contratante" ? "#FFFFFF" : "#000000";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
        size === "medium" && styles.badgeMedium,
        style,
      ]}
    >
      <ThemedText
        type="badge"
        style={[
          styles.text,
          { color: textColor },
          size === "medium" && styles.textMedium,
        ]}
      >
        {RoleLabels[role]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  badgeMedium: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  textMedium: {
    fontSize: 12,
  },
});
