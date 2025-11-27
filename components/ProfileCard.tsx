import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { StarRating } from "@/components/StarRating";
import { Cuidador, Enfermeiro } from "@/types";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

interface ProfileCardProps {
  profile: Cuidador | Enfermeiro;
  onPress: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProfileCard({ profile, onPress }: ProfileCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const formatPrice = (value?: number) => {
    if (!value) return "-";
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const getAvailabilityLabel = (disp: string) => {
    const labels: Record<string, string> = {
      hora: "Hora",
      dia: "Dia",
      semana: "Semana",
      mes: "Mês",
    };
    return labels[disp] || disp;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.header}>
        <Avatar uri={profile.foto} size={70} role={profile.role} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <ThemedText type="h4" style={styles.name} numberOfLines={1}>
              {profile.nome}
            </ThemedText>
            <RoleBadge role={profile.role} />
          </View>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#666666" />
            <ThemedText type="small" style={styles.location}>
              {profile.cidade}
            </ThemedText>
          </View>
          <StarRating
            rating={profile.avaliacaoMedia}
            totalRatings={profile.totalAvaliacoes}
            size={14}
          />
        </View>
      </View>

      <View style={styles.availability}>
        <ThemedText type="caption" style={styles.availabilityLabel}>
          Disponibilidade:
        </ThemedText>
        <View style={styles.availabilityTags}>
          {profile.disponibilidade.map((d) => (
            <View key={d} style={styles.tag}>
              <ThemedText type="caption" style={styles.tagText}>
                {getAvailabilityLabel(d)}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.prices}>
        {profile.valorHora ? (
          <View style={styles.priceItem}>
            <ThemedText type="caption" style={styles.priceLabel}>
              Hora
            </ThemedText>
            <ThemedText type="body" style={styles.priceValue}>
              {formatPrice(profile.valorHora)}
            </ThemedText>
          </View>
        ) : null}
        {profile.valorDia ? (
          <View style={styles.priceItem}>
            <ThemedText type="caption" style={styles.priceLabel}>
              Dia
            </ThemedText>
            <ThemedText type="body" style={styles.priceValue}>
              {formatPrice(profile.valorDia)}
            </ThemedText>
          </View>
        ) : null}
        {profile.valorMensal ? (
          <View style={styles.priceItem}>
            <ThemedText type="caption" style={styles.priceLabel}>
              Mensal
            </ThemedText>
            <ThemedText type="body" style={styles.priceValue}>
              {formatPrice(profile.valorMensal)}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  header: {
    flexDirection: "row",
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  name: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  location: {
    marginLeft: Spacing.xs,
    color: "#666666",
  },
  availability: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  availabilityLabel: {
    color: "#666666",
    marginBottom: Spacing.xs,
  },
  availabilityTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tagText: {
    color: Colors.light.text,
  },
  prices: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  priceItem: {
    alignItems: "center",
  },
  priceLabel: {
    color: "#666666",
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontWeight: "600",
    color: Colors.light.primary,
  },
});
