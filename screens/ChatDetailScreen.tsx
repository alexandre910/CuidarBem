import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Message } from "@/types";
import { ChatStackParamList } from "@/navigation/ChatStackNavigator";

type RouteProps = RouteProp<ChatStackParamList, "ChatDetail">;

export default function ChatDetailScreen() {
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { getMessages, sendMessage } = useData();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
  }, [route.params.conversationId]);

  const loadMessages = async () => {
    const msgs = await getMessages(route.params.conversationId);
    setMessages(msgs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ));
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    const text = inputText.trim();
    setInputText("");

    await sendMessage(route.params.conversationId, text);
    await loadMessages();
    setSending(false);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <ThemedText
            type="body"
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : null,
            ]}
          >
            {item.text}
          </ThemedText>
          <ThemedText
            type="caption"
            style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : null,
            ]}
          >
            {formatTime(item.timestamp)}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="small" style={styles.emptyText}>
              Inicie a conversa enviando uma mensagem
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || Spacing.md }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim() || sending}
          >
            <Feather
              name="send"
              size={20}
              color={inputText.trim() ? Colors.light.buttonText : "#CCCCCC"}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: Spacing.sm,
  },
  ownMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  ownBubble: {
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: Spacing.xs,
  },
  otherBubble: {
    backgroundColor: Colors.light.backgroundDefault,
    borderBottomLeftRadius: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  messageText: {
    marginBottom: Spacing.xs,
  },
  ownMessageText: {
    color: Colors.light.buttonText,
  },
  messageTime: {
    color: "#666666",
    alignSelf: "flex-end",
  },
  ownMessageTime: {
    color: "rgba(0,0,0,0.6)",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    color: "#666666",
    textAlign: "center",
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.light.backgroundDefault,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: Colors.light.backgroundRoot,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
});
