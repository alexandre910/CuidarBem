import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CareScreen from "@/screens/CareScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type CareStackParamList = {
  Care: undefined;
};

const Stack = createNativeStackNavigator<CareStackParamList>();

export default function CareStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Care"
        component={CareScreen}
        options={{
          title: "Cuidados",
        }}
      />
    </Stack.Navigator>
  );
}
