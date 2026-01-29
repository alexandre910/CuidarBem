import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { useRoute, useNavigation, RouteProp, CommonActions } from "@react-navigation/native";
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
  const { getUserById, startConversation, toggleFavorite, isFavorite, reportProfile, rateProfessional, getUserRating, getSubscriptionByUserId } = useData();
  const { user, subscription } = useAuth();
  const [reportModal, setReportModal] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);
  const [confirmServiceModal, setConfirmServiceModal] = useState(false);
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [currentUserRating, setCurrentUserRating] = useState<number | null>(null);
  const [professionalHasActiveSubscription, setProfessionalHasActiveSubscription] = useState(false);

  const profile = getUserById(route.params.profileId) as Cuidador | Enfermeiro | undefined;
  const isContratante = user?.role === "contratante";
  const isEmpresa = user?.role === "empresa";
  const isProfessional = user?.role === "cuidador" || user?.role === "enfermeiro";
  const isViewingProfessional = profile?.role === "cuidador" || profile?.role === "enfermeiro";
  
  // Professionals cannot message other professionals
  const canMessage = !isProfessional || !isViewingProfessional;
  
  // Check if professional has completed availability and values
  const professionalHasAvailability = isViewingProfessional && profile && 
    (profile as Cuidador | Enfermeiro).disponibilidade && 
    (profile as Cuidador | Enfermeiro).disponibilidade.length > 0;
  
  const professionalHasValues = isViewingProfessional && profile && (
    (profile as Cuidador | Enfermeiro).valorHora !== undefined ||
    (profile as Cuidador | Enfermeiro).valorDia !== undefined ||
    (profile as Cuidador | Enfermeiro).valorMensal !== undefined
  );
  
  // Contact info visible only if: user is contratante/empresa AND professional has subscription + availability + values
  const canViewContactInfo = (isContratante || isEmpresa) && !isProfessional && 
    professionalHasActiveSubscription && professionalHasAvailability && professionalHasValues;

  useEffect(() => {
    if (profile) {
      const existingRating = getUserRating(profile.id);
      setCurrentUserRating(existingRating);
      setSelectedRating(existingRating || 0);
    }
  }, [profile]);

  useEffect(() => {
    const checkProfessionalSubscription = async () => {
      if (profile && isViewingProfessional) {
        const sub = await getSubscriptionByUserId(profile.id);
        setProfessionalHasActiveSubscription(sub !== null);
      }
    };
    checkProfessionalSubscription();
  }, [profile, isViewingProfessional]);

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
      navigation.navigate("ChatTab" as any, {
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

  const handleSubmitRating = async () => {
    if (selectedRating === 0) {
      Alert.alert("Erro", "Selecione uma avaliação de 1 a 5 estrelas.");
      return;
    }
    await rateProfessional(profile.id, selectedRating);
    setCurrentUserRating(selectedRating);
    setRatingModal(false);
    Alert.alert(
      "Avaliação Enviada",
      `Você avaliou ${profile.nome} com ${selectedRating} estrela${selectedRating > 1 ? "s" : ""}.`
    );
  };

  const handleOpenRatingModal = () => {
    setConfirmServiceModal(true);
  };

  const handleConfirmService = (confirmed: boolean) => {
    setConfirmServiceModal(false);
    if (confirmed) {
      setSelectedRating(currentUserRating || 0);
      setRatingModal(true);
    }
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
          <Pressable 
            onPress={isContratante ? handleOpenRatingModal : undefined}
            style={styles.ratingContainer}
          >
            <StarRating
              rating={profile.avaliacaoMedia}
              totalRatings={profile.totalAvaliacoes}
              size={20}
              style={styles.rating}
            />
            {isContratante ? (
              <ThemedText type="caption" style={styles.ratingHint}>
                {currentUserRating ? `Sua nota: ${currentUserRating}` : "Toque para avaliar"}
              </ThemedText>
            ) : null}
          </Pressable>
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
        {isProfessional && isViewingProfessional ? (
          <Pressable 
            style={styles.restrictedNotice}
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: "ProfileTab",
                  params: {
                    screen: "Subscription",
                    initial: false,
                  },
                })
              );
            }}
          >
            <Feather name="lock" size={24} color={Colors.light.accent2} />
            <ThemedText type="small" style={styles.restrictedNoticeText}>
              Assine para liberar seu contato aos contratantes
            </ThemedText>
          </Pressable>
        ) : canViewContactInfo && subscription && subscription.status === "ativo" ? (
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
        ) : (isContratante || isEmpresa) && !isProfessional && (!professionalHasActiveSubscription || !professionalHasAvailability || !professionalHasValues) ? (
          <View style={styles.restrictedNotice}>
            <Feather name="lock" size={24} color={Colors.light.accent2} />
            <ThemedText type="small" style={styles.restrictedNoticeText}>
              Profissional ainda não completou o perfil
            </ThemedText>
          </View>
        ) : (
          <Pressable 
            style={styles.subscriptionNotice}
            onPress={() => setSubscriptionModal(true)}
          >
            <Feather name="lock" size={24} color={Colors.light.accent2} />
            <ThemedText type="small" style={styles.subscriptionNoticeText}>
              Assine para ver telefone e e-mail
            </ThemedText>
          </Pressable>
        )}
      </View>

      {canMessage ? (
        <Button
          onPress={handleContact}
          style={styles.contactButton}
          icon={<Feather name="message-circle" size={20} color={Colors.light.buttonText} />}
        >
          Enviar Mensagem
        </Button>
      ) : null}

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

      <Modal
        visible={confirmServiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Serviço Concluído?
            </ThemedText>

            <ThemedText type="body" style={styles.confirmServiceText}>
              O serviço com {profile.nome} foi concluído?
            </ThemedText>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.confirmNoButton}
                onPress={() => handleConfirmService(false)}
              >
                <ThemedText type="body" style={styles.confirmNoButtonText}>Não</ThemedText>
              </Pressable>
              <Pressable
                style={styles.confirmYesButton}
                onPress={() => handleConfirmService(true)}
              >
                <ThemedText type="body" style={styles.confirmYesButtonText}>Sim</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={ratingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Avaliar Profissional
            </ThemedText>

            <ThemedText type="body" style={styles.ratingProfileName}>
              {profile.nome}
            </ThemedText>

            <View style={styles.ratingStarsContainer}>
              <StarRating
                rating={selectedRating}
                size={40}
                onRate={(rating) => setSelectedRating(rating)}
                showCount={false}
              />
            </View>

            <ThemedText type="caption" style={styles.ratingDescription}>
              {selectedRating === 0 && "Toque nas estrelas para avaliar"}
              {selectedRating === 1 && "Muito ruim"}
              {selectedRating === 2 && "Ruim"}
              {selectedRating === 3 && "Regular"}
              {selectedRating === 4 && "Bom"}
              {selectedRating === 5 && "Excelente"}
            </ThemedText>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setRatingModal(false);
                  setSelectedRating(currentUserRating || 0);
                }}
              >
                <ThemedText type="body">Cancelar</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.ratingSubmitButton,
                  selectedRating === 0 && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitRating}
                disabled={selectedRating === 0}
              >
                <ThemedText type="body" style={styles.confirmYesButtonText}>
                  OK
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={subscriptionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.subscriptionModalContent}>
            <ThemedText type="subtitle" style={styles.subscriptionModalTitle}>
              Assinatura Necessária
            </ThemedText>

            <ThemedText type="body" style={styles.subscriptionModalText}>
              Para entrar em contato com profissionais, você precisa ter uma assinatura ativa.
            </ThemedText>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setSubscriptionModal(false)}
              >
                <ThemedText type="body">Cancelar</ThemedText>
              </Pressable>
              <Pressable
                style={styles.viewPlansButton}
                onPress={() => {
                  setSubscriptionModal(false);
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: "ProfileTab",
                      params: {
                        screen: "Subscription",
                        initial: false,
                      },
                    })
                  );
                }}
              >
                <ThemedText type="body" style={styles.viewPlansButtonText}>
                  Ver Planos
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
  restrictedNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.accent2,
  },
  restrictedNoticeText: {
    marginLeft: Spacing.md,
    color: Colors.light.accent2,
    fontWeight: "500",
  },
  subscriptionModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  subscriptionModalTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    color: "#000000",
  },
  subscriptionModalText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    color: "#000000",
  },
  viewPlansButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  viewPlansButtonText: {
    color: "#000000",
    fontWeight: "600",
  },
  contactButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    borderBottomWidth: 4,
    borderBottomColor: "#00B3A3",
    borderRightWidth: 2,
    borderRightColor: "#00D4C4",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
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
  ratingContainer: {
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  ratingHint: {
    color: Colors.light.accent1,
    marginTop: Spacing.xs,
    fontWeight: "500",
  },
  ratingProfileName: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    color: "#666666",
  },
  ratingStarsContainer: {
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  ratingDescription: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    color: "#666666",
    fontSize: 16,
  },
  ratingSubmitButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  confirmServiceText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    color: "#333333",
  },
  confirmNoButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    alignItems: "center",
  },
  confirmNoButtonText: {
    color: "#333333",
    fontWeight: "600",
  },
  confirmYesButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  confirmYesButtonText: {
    color: "#000000",
    fontWeight: "600",
  },
});
