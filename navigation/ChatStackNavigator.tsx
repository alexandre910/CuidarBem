import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ConversationsScreen from "@/screens/ConversationsScreen";
import ChatDetailScreen from "@/screens/ChatDetailScreen";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type ChatStackParamList = {
  Conversations: undefined;
  ChatDetail: { conversationId: string };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{
          headerTitle: "Conversas",
        }}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={{
          headerTitle: "Chat",
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
        }}
      />
    </Stack.Navigator>
  );
}
