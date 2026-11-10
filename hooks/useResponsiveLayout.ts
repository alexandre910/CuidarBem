import { Platform, useWindowDimensions } from "react-native";

import { Spacing } from "@/constants/theme";

export const WEB_DESKTOP_BREAKPOINT = 1100;
export const WEB_CONTENT_MAX_WIDTH = 1320;

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isDesktop =
    Platform.OS === "web" && width >= WEB_DESKTOP_BREAKPOINT;

  return {
    width,
    height,
    isDesktop,
    contentMaxWidth: WEB_CONTENT_MAX_WIDTH,
    horizontalPadding: isDesktop ? Spacing["3xl"] : Spacing.xl,
  };
}
