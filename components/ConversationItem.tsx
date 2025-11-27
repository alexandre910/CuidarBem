import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { Conversation, UserProfile } from "@/types";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface ConversationItemProps {
  conversation: Conversation;
  otherUser?: UserProfile;
  onPress: () => void;
  hasUnread?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ConversationItem({
  conversation,
  otherUser,
  onPress,
  hasUnread = false,
}: ConversationItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (hours < 168) {
      return date.toLocaleDateString("pt-BR", { weekday: "short" });
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.avatarContainer}>
        <Avatar uri={otherUser?.foto} size={50} role={otherUser?.role} />
        {hasUnread ? <View style={styles.unreadDot} /> : null}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <ThemedText type="body" style={styles.name} numberOfLines={1}>
              {otherUser?.nome || "Usuário"}
            </ThemedText>
            {otherUser?.role ? (
              <RoleBadge role={otherUser.role} style={styles.badge} />
            ) : null}
          </View>
          <ThemedText type="caption" style={styles.time}>
            {conversation.lastMessage
              ? formatTime(conversation.lastMessage.timestamp)
              : formatTime(conversation.updatedAt)}
          </ThemedText>
        </View>

        <ThemedText
          type="small"
          style={[styles.preview, hasUnread && styles.previewUnread]}
          numberOfLines={1}
        >
          {conversation.lastMessage?.text || "Iniciar conversa..."}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: Colors.light.backgroundDefault,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatarContainer: {
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.accent2,
    borderWidth: 2,
    borderColor: Colors.light.backgroundDefault,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  nameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontWeight: "600",
    marginRight: Spacing.xs,
  },
  badge: {
    marginLeft: Spacing.xs,
  },
  time: {
    color: "#666666",
  },
  preview: {
    color: "#666666",
  },
  previewUnread: {
    fontWeight: "600",
    color: Colors.light.text,
  },
});
