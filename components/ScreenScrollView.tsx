import React, { forwardRef } from "react";
import { ScrollView, ScrollViewProps, StyleSheet } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

export const ScreenScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function ScreenScrollView(
    {
      children,
      contentContainerStyle,
      style,
      ...scrollViewProps
    },
    ref
  ) {
    const { theme } = useTheme();
    const { paddingTop, paddingBottom, scrollInsetBottom } = useScreenInsets();
    const { contentMaxWidth, horizontalPadding, isDesktop } =
      useResponsiveLayout();

    return (
      <ScrollView
        ref={ref}
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
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
