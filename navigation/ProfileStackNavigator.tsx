import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "@/screens/ProfileScreen";
import SubscriptionScreen from "@/screens/SubscriptionScreen";
import FavoritesScreen from "@/screens/FavoritesScreen";
import ServiceHistoryScreen from "@/screens/ServiceHistoryScreen";
import PaymentHistoryScreen from "@/screens/PaymentHistoryScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type ProfileStackParamList = {
  Profile: undefined;
  Subscription: undefined;
  Favorites: undefined;
  ServiceHistory: undefined;
  PaymentHistory: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Meu Perfil",
        }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          title: "Assinatura",
        }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Favoritos",
        }}
      />
      <Stack.Screen
        name="ServiceHistory"
        component={ServiceHistoryScreen}
        options={{
          title: "Histórico",
        }}
      />
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{
          title: "Pagamentos",
        }}
      />
    </Stack.Navigator>
  );
}
