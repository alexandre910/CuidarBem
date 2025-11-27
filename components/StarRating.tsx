import React from "react";
import { StyleSheet, View, Pressable, ViewStyle, StyleProp } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  size?: number;
  onRate?: (rating: number) => void;
  style?: StyleProp<ViewStyle>;
  showCount?: boolean;
}

export function StarRating({
  rating,
  totalRatings,
  size = 16,
  onRate,
  style,
  showCount = true,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= Math.floor(rating);
    const isHalf = !isFilled && starNumber <= Math.ceil(rating) && rating % 1 >= 0.5;

    const StarComponent = (
      <Feather
        name={isFilled || isHalf ? "star" : "star"}
        size={size}
        color={isFilled || isHalf ? Colors.light.starFilled : Colors.light.starEmpty}
        style={[
          styles.star,
          { opacity: isFilled ? 1 : isHalf ? 0.7 : 0.3 },
        ]}
      />
    );

    if (onRate) {
      return (
        <Pressable
          key={starNumber}
          onPress={() => onRate(starNumber)}
          style={styles.starButton}
        >
          {StarComponent}
        </Pressable>
      );
    }

    return <View key={starNumber}>{StarComponent}</View>;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {stars.map(renderStar)}
      </View>
      {showCount && totalRatings !== undefined ? (
        <ThemedText type="caption" style={styles.count}>
          ({totalRatings})
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
  },
  star: {
    marginRight: 2,
  },
  starButton: {
    padding: 2,
  },
  count: {
    marginLeft: Spacing.xs,
    color: "#666666",
  },
});
