import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Text } from "react-native";

import SearchStackNavigator from "@/navigation/SearchStackNavigator";
import ChatStackNavigator from "@/navigation/ChatStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import CareStackNavigator from "@/navigation/CareStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

export type MainTabParamList = {
  SearchTab: undefined;
  ChatTab: undefined;
  CareTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { unreadCount } = useData();
  const { isDesktop } = useResponsiveLayout();

  const showCareTab = user?.role === "contratante";

  return (
    <Tab.Navigator
      initialRouteName="SearchTab"
      screenOptions={{
        tabBarPosition: isDesktop ? "left" : "bottom",
        tabBarVariant: isDesktop ? "material" : "uikit",
        tabBarLabelPosition: isDesktop ? "beside-icon" : "below-icon",
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarActiveBackgroundColor: isDesktop
          ? "rgba(148, 43, 24, 0.10)"
          : undefined,
        tabBarItemStyle: isDesktop ? styles.desktopTabItem : undefined,
        tabBarLabelStyle: isDesktop ? styles.desktopTabLabel : undefined,
        tabBarStyle: isDesktop
          ? styles.desktopTabBar
          : {
              position: "absolute",
              backgroundColor: Platform.select({
                ios: "transparent",
                android: Colors.light.backgroundRoot,
              }),
              borderTopWidth: 0,
              elevation: 0,
            },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size }}>
              <Feather name="message-circle" size={size} color={color} />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
          ),
        }}
      />
      {showCareTab ? (
        <Tab.Screen
          name="CareTab"
          component={CareStackNavigator}
          options={{
            title: "Cuidados",
            tabBarIcon: ({ color, size }) => (
              <Feather name="heart" size={size} color={color} />
            ),
          }}
        />
      ) : null}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Feather name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  desktopTabBar: {
    width: 248,
    backgroundColor: Colors.light.backgroundDefault,
    borderRightColor: Colors.light.border,
    borderRightWidth: 1,
    borderTopWidth: 0,
    elevation: 0,
    paddingTop: Spacing.xl,
  },
  desktopTabItem: {
    minHeight: 52,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  desktopTabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -4,
    backgroundColor: "#DC4429",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
