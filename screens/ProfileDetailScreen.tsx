import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/Button";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { SearchStackParamList } from "@/navigation/SearchStackNavigator";
import { Cuidador, Enfermeiro } from "@/types";

type RouteProps = RouteProp<SearchStackParamList, "ProfileDetail">;
type NavigationProp = NativeStackNavigationProp<SearchStackParamList>;

const REPORT_REASONS = [
  "Informações falsas",
  "Comportamento inadequado",
  "Spam ou fraude",
  "Perfil falso",
  "Outro",
];

export default function ProfileDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { getUserById, startConversation, toggleFavorite, isFavorite, reportProfile } = useData();
  const { subscription } = useAuth();
  const [reportModal, setReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const profile = getUserById(route.params.profileId) as Cuidador | Enfermeiro | undefined;

  if (!profile) {
    return (
      <ScreenScrollView>
        <View style={styles.errorContainer}>
          <ThemedText type="body">Perfil não encontrado</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const formatPrice = (value?: number) => {
    if (!value) return "-";
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const getAvailabilityLabel = (disp: string) => {
    const labels: Record<string, string> = {
      hora: "Por Hora",
      dia: "Por Dia",
      semana: "Por Semana",
      mes: "Por Mês",
    };
    return labels[disp] || disp;
  };

  const handleContact = async () => {
    if (!subscription || subscription.status !== "ativo") {
      Alert.alert(
        "Assinatura Necessária",
        "Para entrar em contato com profissionais, você precisa ter uma assinatura ativa.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Ver Planos",
            onPress: () => {},
          },
        ]
      );
      return;
    }

    const conversationId = await startConversation(profile.id);
    if (conversationId) {
      navigation.navigate("Chat" as any, {
        screen: "ChatDetail",
        params: { conversationId },
      });
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(profile.id);
  };

  const handleReport = async () => {
    if (!selectedReason) {
      Alert.alert("Erro", "Selecione um motivo para a denúncia.");
      return;
    }
    await reportProfile(profile.id, selectedReason, reportDescription);
    setReportModal(false);
    setSelectedReason("");
    setReportDescription("");
    Alert.alert(
      "Denúncia Enviada",
      "Obrigado por ajudar a manter nossa comunidade segura. Analisaremos sua denúncia."
    );
  };

  const favorited = isFavorite(profile.id);

  return (
    <ScreenScrollView>
      <View style={styles.actionButtons}>
        <Pressable
          onPress={handleToggleFavorite}
          style={styles.actionButton}
        >
          <Feather
            name="heart"
            size={24}
            color={favorited ? Colors.light.accent.red : "#CCCCCC"}
            style={favorited ? styles.heartFilled : undefined}
          />
        </Pressable>
        <Pressable
          onPress={() => setReportModal(true)}
          style={styles.actionButton}
        >
          <Feather name="flag" size={24} color="#999999" />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Avatar uri={profile.foto} size={120} role={profile.role} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <ThemedText type="h3" style={styles.name}>
            {profile.nome}
          </ThemedText>
          <RoleBadge role={profile.role} size="medium" style={styles.badge} />
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={16} color="#666666" />
            <ThemedText type="body" style={styles.location}>
              {profile.cidade}
            </ThemedText>
          </View>
          <StarRating
            rating={profile.avaliacaoMedia}
            totalRatings={profile.totalAvaliacoes}
            size={20}
            style={styles.rating}
          />
        </View>
      </View>

      {profile.role === "enfermeiro" && profile.coren ? (
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Registro Profissional
          </ThemedText>
          <View style={styles.infoCard}>
            <Feather name="award" size={20} color={Colors.light.accent1} />
            <ThemedText type="body" style={styles.infoText}>
              {profile.coren}
            </ThemedText>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Disponibilidade
        </ThemedText>
        <View style={styles.tagsContainer}>
          {profile.disponibilidade.map((d) => (
            <View key={d} style={styles.tag}>
              <ThemedText type="body" style={styles.tagText}>
                {getAvailabilityLabel(d)}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Valores
        </ThemedText>
        <View style={styles.pricesContainer}>
          <View style={styles.priceCard}>
            <ThemedText type="caption" style={styles.priceLabel}>
              Por Hora
            </ThemedText>
            <ThemedText type="h4" style={styles.priceValue}>
              {formatPrice(profile.valorHora)}
            </ThemedText>
          </View>
          <View style={styles.priceCard}>
            <ThemedText type="caption" style={styles.priceLabel}>
              Por Dia
            </ThemedText>
            <ThemedText type="h4" style={styles.priceValue}>
              {formatPrice(profile.valorDia)}
            </ThemedText>
          </View>
          <View style={styles.priceCard}>
            <ThemedText type="caption" style={styles.priceLabel}>
              Mensal
            </ThemedText>
            <ThemedText type="h4" style={styles.priceValue}>
              {formatPrice(profile.valorMensal)}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Contato
        </ThemedText>
        {subscription && subscription.status === "ativo" ? (
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Feather name="phone" size={18} color={Colors.light.text} />
              <ThemedText type="body" style={styles.contactText}>
                {profile.telefone}
              </ThemedText>
            </View>
            <View style={styles.contactRow}>
              <Feather name="mail" size={18} color={Colors.light.text} />
              <ThemedText type="body" style={styles.contactText}>
                {profile.email}
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.subscriptionNotice}>
            <Feather name="lock" size={24} color={Colors.light.accent2} />
            <ThemedText type="small" style={styles.subscriptionNoticeText}>
              Assine para ver telefone e e-mail
            </ThemedText>
          </View>
        )}
      </View>

      <Button
        onPress={handleContact}
        style={styles.contactButton}
        icon={<Feather name="message-circle" size={20} color={Colors.light.buttonText} />}
      >
        Enviar Mensagem
      </Button>

      <Modal
        visible={reportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Denunciar Perfil
            </ThemedText>

            <ThemedText type="small" style={styles.modalLabel}>
              Motivo da denúncia
            </ThemedText>
            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={styles.radioOuter}>
                  {selectedReason === reason ? (
                    <View style={styles.radioInner} />
                  ) : null}
                </View>
                <ThemedText type="body">{reason}</ThemedText>
              </Pressable>
            ))}

            <TextInput
              style={styles.reportInput}
              placeholder="Descreva o problema (opcional)"
              placeholderTextColor="#999999"
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setReportModal(false);
                  setSelectedReason("");
                  setReportDescription("");
                }}
              >
                <ThemedText type="body">Cancelar</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.submitButton,
                  !selectedReason && styles.submitButtonDisabled,
                ]}
                onPress={handleReport}
                disabled={!selectedReason}
              >
                <ThemedText type="body" style={styles.submitButtonText}>
                  Enviar
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionButton: {
    padding: Spacing.sm,
  },
  heartFilled: {
    opacity: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    marginBottom: Spacing.lg,
  },
  headerInfo: {
    alignItems: "center",
  },
  name: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  badge: {
    marginBottom: Spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  location: {
    marginLeft: Spacing.xs,
    color: "#666666",
  },
  rating: {
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoText: {
    marginLeft: Spacing.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagText: {
    fontWeight: "600",
  },
  pricesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  priceLabel: {
    color: "#666666",
    marginBottom: Spacing.xs,
  },
  priceValue: {
    color: Colors.light.text,
  },
  contactInfo: {
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  contactText: {
    marginLeft: Spacing.md,
  },
  subscriptionNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.accent2,
  },
  subscriptionNoticeText: {
    marginLeft: Spacing.md,
    color: Colors.light.accent2,
    fontWeight: "500",
  },
  contactButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    color: "#666666",
    marginBottom: Spacing.sm,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  reasonOptionSelected: {
    opacity: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    alignItems: "center",
  },
  submitButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.accent.red,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
