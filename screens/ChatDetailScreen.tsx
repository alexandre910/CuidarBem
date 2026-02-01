import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  KeyboardAvoidingView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Message } from "@/types";
import { ChatStackParamList } from "@/navigation/ChatStackNavigator";

type RouteProps = RouteProp<ChatStackParamList, "ChatDetail">;
type NavigationProps = NativeStackNavigationProp<ChatStackParamList, "ChatDetail">;

export default function ChatDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { getMessages, sendMessage, conversations, getUserById } = useData();
  const { user } = useAuth();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const conversation = conversations.find((c) => c.id === route.params.conversationId);
  const otherParticipantId = conversation?.participants.find((p) => p !== user?.id);
  const otherUser = otherParticipantId ? getUserById(otherParticipantId) : null;

  const isProfessional = user?.role === "enfermeiro" || user?.role === "cuidador";
  const isOtherUserContractor = otherUser?.role === "contratante";
  const canViewCuidados = isProfessional && isOtherUserContractor;

  useLayoutEffect(() => {
    if (otherUser) {
      navigation.setOptions({
        headerTitle: () => (
          <Pressable
            style={styles.headerTitleContainer}
            onPress={() => {
              if (canViewCuidados && otherParticipantId) {
                navigation.navigate("ViewContractorCuidados", { contratanteId: otherParticipantId });
              }
            }}
            disabled={!canViewCuidados}
          >
            <View style={[styles.headerAvatar, canViewCuidados && styles.headerAvatarClickable]}>
              {otherUser.foto ? (
                <Image source={{ uri: otherUser.foto }} style={styles.headerAvatarImage} />
              ) : (
                <Feather name="user" size={18} color={Colors.light.text} />
              )}
            </View>
            <View>
              <ThemedText type="body" style={styles.headerName} numberOfLines={1}>
                {otherUser.nome}
              </ThemedText>
              {canViewCuidados ? (
                <ThemedText type="caption" style={styles.headerHint}>
                  Toque para ver cuidados
                </ThemedText>
              ) : null}
            </View>
          </Pressable>
        ),
      });
    }
  }, [navigation, otherUser, canViewCuidados, otherParticipantId]);

  const inputContainerStyle = useAnimatedStyle(() => {
    const keyboardOffset = -keyboardHeight.value;
    const adjustedOffset = keyboardOffset > 0 ? keyboardOffset * 0.5 : 0;
    return {
      paddingBottom: Platform.OS === "web" 
        ? tabBarHeight + Spacing.sm 
        : Math.max(adjustedOffset, tabBarHeight + Spacing.sm),
    };
  });

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
      behavior="padding"
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

      <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
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
      </Animated.View>
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
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatarClickable: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  headerAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerName: {
    fontWeight: "600",
    maxWidth: 180,
  },
  headerHint: {
    color: "#DC4429",
    fontSize: 12,
  },
});
