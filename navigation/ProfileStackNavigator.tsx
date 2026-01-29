import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";

import ProfileScreen from "@/screens/ProfileScreen";
import SubscriptionScreen from "@/screens/SubscriptionScreen";
import FavoritesScreen from "@/screens/FavoritesScreen";
import ServiceHistoryScreen from "@/screens/ServiceHistoryScreen";
import PaymentHistoryScreen from "@/screens/PaymentHistoryScreen";
import ServiceValuesScreen from "@/screens/ServiceValuesScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { Colors, Spacing } from "@/constants/theme";

export type ProfileStackParamList = {
  Profile: { openSection?: "dados" } | undefined;
  Subscription: undefined;
  Favorites: undefined;
  ServiceHistory: undefined;
  PaymentHistory: undefined;
  ServiceValues: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

function ProfileBackButton() {
  const navigation = useNavigation<any>();
  return (
    <Pressable
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate({
            name: "SearchTab",
          })
        );
      }}
      style={{ paddingRight: Spacing.md }}
    >
      <Feather name="arrow-left" size={24} color={Colors.light.text} />
    </Pressable>
  );
}

export default function ProfileStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Meu Perfil",
          headerLeft: () => <ProfileBackButton />,
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
      <Stack.Screen
        name="ServiceValues"
        component={ServiceValuesScreen}
        options={{
          title: "Valores de Serviços",
        }}
      />
    </Stack.Navigator>
  );
}
