import React from "react";
import { FlatList, FlatListProps, StyleSheet } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

export function ScreenFlatList<T>({
  contentContainerStyle,
  style,
  ...flatListProps
}: FlatListProps<T>) {
  const { theme } = useTheme();
  const { paddingTop, paddingBottom, scrollInsetBottom } = useScreenInsets();
  const { contentMaxWidth, horizontalPadding, isDesktop } =
    useResponsiveLayout();

  return (
    <FlatList
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot },
        style,
      ]}
      contentContainerStyle={[
        {
          paddingTop,
          paddingBottom,
          paddingHorizontal: horizontalPadding,
          width: "100%",
          maxWidth: isDesktop ? contentMaxWidth : undefined,
          alignSelf: "center",
        },
        contentContainerStyle,
      ]}
      scrollIndicatorInsets={{ bottom: scrollInsetBottom }}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
