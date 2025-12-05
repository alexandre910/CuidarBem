import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ConversationItem } from "@/components/ConversationItem";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Colors, Spacing } from "@/constants/theme";
import { Conversation } from "@/types";
import { ChatStackParamList } from "@/navigation/ChatStackNavigator";

type NavigationProp = NativeStackNavigationProp<ChatStackParamList>;

export default function ConversationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { conversations, getUserById, deleteConversation } = useData();
  const { user } = useAuth();
  const { paddingTop, paddingBottom } = useScreenInsets();

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate("ChatDetail", { conversationId: conversation.id });
  };

  const getOtherUser = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find((id) => id !== user?.id);
    if (otherUserId) {
      return getUserById(otherUserId);
    }
    return undefined;
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId);
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      otherUser={getOtherUser(item)}
      onPress={() => handleConversationPress(item)}
      onDelete={() => handleDeleteConversation(item.id)}
      hasUnread={
        item.lastMessage
          ? !item.lastMessage.read && item.lastMessage.senderId !== user?.id
          : false
      }
    />
  );

  return (
    <View style={[styles.container, { paddingTop }]}>
      <FlatList
        data={sortedConversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: paddingBottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="message-circle" size={48} color="#CCCCCC" />
            <ThemedText type="body" style={styles.emptyText}>
              Nenhuma conversa ainda
            </ThemedText>
            <ThemedText type="small" style={styles.emptySubtext}>
              Inicie uma conversa com um profissional
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  list: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    marginTop: Spacing.lg,
    color: "#666666",
  },
  emptySubtext: {
    marginTop: Spacing.xs,
    color: "#999999",
    textAlign: "center",
  },
});
