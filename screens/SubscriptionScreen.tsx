import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Subscription, Cuidador, Enfermeiro } from "@/types";

const plans = [
  {
    id: "mensal",
    title: "Plano Mensal",
    price: 29.9,
    period: "mês",
    features: [
      "Acesso a todos os perfis",
      "Chat ilimitado",
      "Ver telefone e e-mail",
      "Avaliações",
    ],
  },
  {
    id: "anual",
    title: "Plano Anual",
    price: 299.9,
    period: "ano",
    originalPrice: 358.8,
    features: [
      "Tudo do plano mensal",
      "2 meses grátis",
      "Suporte prioritário",
      "Selo de destaque",
    ],
    recommended: true,
  },
];

type PaymentMethod = "pix" | "cartao";
type PixKeyType = "cpf" | "email" | "celular" | "aleatoria";

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { user, subscription, updateSubscription, updateProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cpf");
  const [pixKey, setPixKey] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardName, setCardName] = useState("");

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    let formatted = numbers;
    if (numbers.length > 3) {
      formatted = numbers.slice(0, 3) + "." + numbers.slice(3);
    }
    if (numbers.length > 6) {
      formatted = numbers.slice(0, 3) + "." + numbers.slice(3, 6) + "." + numbers.slice(6);
    }
    if (numbers.length > 9) {
      formatted = numbers.slice(0, 3) + "." + numbers.slice(3, 6) + "." + numbers.slice(6, 9) + "-" + numbers.slice(9);
    }
    return formatted;
  };

  const formatCelular = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    let formatted = numbers;
    if (numbers.length > 0) {
      formatted = "(" + numbers.slice(0, 2);
    }
    if (numbers.length > 2) {
      formatted = "(" + numbers.slice(0, 2) + ") " + numbers.slice(2);
    }
    if (numbers.length > 7) {
      formatted = "(" + numbers.slice(0, 2) + ") " + numbers.slice(2, 7) + "-" + numbers.slice(7);
    }
    return formatted;
  };

  const handlePixKeyChange = (value: string) => {
    if (pixKeyType === "cpf") {
      setPixKey(formatCpf(value));
    } else if (pixKeyType === "celular") {
      setPixKey(formatCelular(value));
    } else {
      setPixKey(value);
    }
  };

  const resetPaymentForm = () => {
    setPaymentMethod("pix");
    setPixKeyType("cpf");
    setPixKey("");
    setCardNumber("");
    setCardCvv("");
    setCardExpiry("");
    setCardName("");
  };

  const openPaymentModal = () => {
    if (!selectedPlan) {
      Alert.alert("Atenção", "Por favor, selecione um plano primeiro.");
      return;
    }
    resetPaymentForm();
    setPaymentModal(true);
  };

  const validatePayment = (): boolean => {
    if (paymentMethod === "pix") {
      if (!pixKey.trim()) {
        Alert.alert("Atenção", "Por favor, insira sua chave PIX.");
        return false;
      }
      if (pixKeyType === "cpf" && pixKey.replace(/\D/g, "").length !== 11) {
        Alert.alert("Atenção", "CPF deve conter 11 dígitos.");
        return false;
      }
      if (pixKeyType === "email" && !pixKey.includes("@")) {
        Alert.alert("Atenção", "Por favor, insira um e-mail válido.");
        return false;
      }
      if (pixKeyType === "celular" && pixKey.replace(/\D/g, "").length < 10) {
        Alert.alert("Atenção", "Número de celular inválido.");
        return false;
      }
    } else {
      const cleanCardNumber = cardNumber.replace(/\D/g, "");
      if (cleanCardNumber.length !== 16) {
        Alert.alert("Atenção", "O número do cartão deve conter 16 dígitos.");
        return false;
      }
      if (cardCvv.length < 3) {
        Alert.alert("Atenção", "CVV deve conter 3 ou 4 dígitos.");
        return false;
      }
      if (!cardExpiry.includes("/") || cardExpiry.length < 5) {
        Alert.alert("Atenção", "Data de vencimento inválida. Use o formato MM/AA.");
        return false;
      }
      if (!cardName.trim()) {
        Alert.alert("Atenção", "Por favor, insira o nome completo do titular.");
        return false;
      }
    }
    return true;
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancelar Assinatura",
      "Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium e sua disponibilidade e valores serão zerados.",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, Cancelar",
          style: "destructive",
          onPress: async () => {
            if (subscription) {
              const cancelledSubscription: Subscription = {
                ...subscription,
                status: "cancelado",
              };
              await updateSubscription(cancelledSubscription);
              
              if (user && (user.role === "cuidador" || user.role === "enfermeiro")) {
                const resetData: Partial<Cuidador | Enfermeiro> = {
                  disponibilidade: [],
                  valorHora: undefined,
                  valorDia: undefined,
                  valorMensal: undefined,
                };
                await updateProfile(resetData);
              }
              
              Alert.alert("Assinatura Cancelada", "Sua assinatura foi cancelada com sucesso. Sua disponibilidade e valores foram zerados.");
            }
          },
        },
      ]
    );
  };

  const handleConfirmPayment = async () => {
    if (!validatePayment()) return;
    if (!selectedPlan) return;

    setProcessing(true);
    setPaymentModal(false);

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan || !user) {
      setProcessing(false);
      return;
    }

    const now = new Date();
    const expirationDate = new Date();
    if (selectedPlan === "mensal") {
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId: user.id,
      tipo: selectedPlan as "mensal" | "anual",
      status: "ativo",
      dataInicio: now.toISOString(),
      dataVencimento: expirationDate.toISOString(),
      valor: plan.price,
    };

    await updateSubscription(newSubscription);
    setProcessing(false);

    const paymentMethodLabel = paymentMethod === "pix" ? "PIX" : "Cartão de Crédito";
    const isProfessional = user.role === "cuidador" || user.role === "enfermeiro";
    
    if (isProfessional) {
      Alert.alert(
        "Assinatura Ativada",
        `Seu ${plan.title} foi ativado com sucesso via ${paymentMethodLabel}! Válido até ${expirationDate.toLocaleDateString("pt-BR")}.\n\nComplete a disponibilidade e valores no seu perfil para liberar acesso ao seu e-mail, telefone e receber ou enviar mensagens ao contratante.\n\nAo concluir o preenchimento de disponibilidade (por hora, por dia ou por mês) e valores, estará liberado.`,
        [
          {
            text: "Ir para Valores de Serviços",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      Alert.alert(
        "Assinatura Ativada",
        `Seu ${plan.title} foi ativado com sucesso via ${paymentMethodLabel}! Válido até ${expirationDate.toLocaleDateString("pt-BR")}.`
      );
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  const getPixKeyPlaceholder = () => {
    switch (pixKeyType) {
      case "cpf":
        return "000.000.000-00";
      case "email":
        return "seu@email.com";
      case "celular":
        return "(00) 00000-0000";
      case "aleatoria":
        return "Chave aleatória";
      default:
        return "";
    }
  };

  const getPixKeyLabel = () => {
    switch (pixKeyType) {
      case "cpf":
        return "CPF";
      case "email":
        return "E-mail";
      case "celular":
        return "Celular";
      case "aleatoria":
        return "Chave Aleatória";
      default:
        return "";
    }
  };

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <ThemedText type="h3" style={styles.title}>
          Escolha seu Plano
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Desbloqueie todas as funcionalidades
        </ThemedText>
      </View>

      {subscription?.status === "ativo" ? (
        <View style={styles.currentPlanCard}>
          <View style={styles.currentPlanHeader}>
            <Feather name="check-circle" size={24} color={Colors.light.success} />
            <ThemedText type="h4" style={styles.currentPlanTitle}>
              Plano Ativo
            </ThemedText>
          </View>
          <ThemedText type="body" style={styles.currentPlanType}>
            {subscription.tipo === "mensal" ? "Plano Mensal" : "Plano Anual"}
          </ThemedText>
          <ThemedText type="small" style={styles.currentPlanDate}>
            Válido até: {new Date(subscription.dataVencimento).toLocaleDateString("pt-BR")}
          </ThemedText>
        </View>
      ) : null}

      {plans.map((plan) => (
        <Pressable
          key={plan.id}
          onPress={() => setSelectedPlan(plan.id)}
          style={[
            styles.planCard,
            selectedPlan === plan.id && styles.planCardSelected,
            plan.recommended && styles.planCardRecommended,
          ]}
        >
          {plan.recommended ? (
            <View style={styles.recommendedBadge}>
              <ThemedText type="caption" style={styles.recommendedText}>
                Recomendado
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.planHeader}>
            <View>
              <ThemedText type="h4" style={styles.planTitle}>
                {plan.title}
              </ThemedText>
              {plan.originalPrice ? (
                <ThemedText type="caption" style={styles.originalPrice}>
                  De {formatPrice(plan.originalPrice)}
                </ThemedText>
              ) : null}
            </View>
            <View style={styles.priceContainer}>
              <ThemedText type="h3" style={styles.planPrice}>
                {formatPrice(plan.price)}
              </ThemedText>
              <ThemedText type="caption" style={styles.planPeriod}>
                /{plan.period}
              </ThemedText>
            </View>
          </View>

          <View style={styles.planFeatures}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.light.success} />
                <ThemedText type="small" style={styles.featureText}>
                  {feature}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.selectIndicator}>
            <View
              style={[
                styles.radioOuter,
                selectedPlan === plan.id && styles.radioOuterSelected,
              ]}
            >
              {selectedPlan === plan.id ? (
                <View style={styles.radioInner} />
              ) : null}
            </View>
          </View>
        </Pressable>
      ))}

      {subscription?.status === "ativo" ? (
        <Pressable
          style={styles.cancelSubscriptionButton}
          onPress={handleCancelSubscription}
        >
          <ThemedText type="body" style={styles.cancelSubscriptionText}>
            Cancelar Assinatura
          </ThemedText>
        </Pressable>
      ) : (
        <Button
          onPress={openPaymentModal}
          loading={processing}
          disabled={!selectedPlan}
          style={styles.subscribeButton}
        >
          Assinar Agora
        </Button>
      )}

      <ThemedText type="caption" style={styles.disclaimer}>
        Pagamento processado de forma segura. Você pode cancelar a qualquer
        momento. Ao assinar, você concorda com nossos Termos de Uso.
      </ThemedText>

      <Modal
        visible={paymentModal}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Forma de Pagamento</ThemedText>
              <Pressable onPress={() => setPaymentModal(false)}>
                <Feather name="x" size={24} color={Colors.light.text} />
              </Pressable>
            </View>

            <KeyboardAwareScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.paymentMethodSelector}>
                <Pressable
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === "pix" && styles.paymentMethodSelected,
                  ]}
                  onPress={() => setPaymentMethod("pix")}
                >
                  <Feather
                    name="smartphone"
                    size={24}
                    color={paymentMethod === "pix" ? "#942B18" : "#666666"}
                  />
                  <ThemedText
                    type="body"
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === "pix" && styles.paymentMethodTextSelected,
                    ]}
                  >
                    PIX
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === "cartao" && styles.paymentMethodSelected,
                  ]}
                  onPress={() => setPaymentMethod("cartao")}
                >
                  <Feather
                    name="credit-card"
                    size={24}
                    color={paymentMethod === "cartao" ? "#942B18" : "#666666"}
                  />
                  <ThemedText
                    type="body"
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === "cartao" && styles.paymentMethodTextSelected,
                    ]}
                  >
                    Cartão de Crédito
                  </ThemedText>
                </Pressable>
              </View>

              {paymentMethod === "pix" ? (
                <View style={styles.formSection}>
                  <ThemedText type="body" style={styles.formLabel}>
                    Tipo de Chave PIX
                  </ThemedText>
                  <View style={styles.pixKeyTypeSelector}>
                    {(["cpf", "email", "celular", "aleatoria"] as PixKeyType[]).map((type) => (
                      <Pressable
                        key={type}
                        style={[
                          styles.pixKeyTypeOption,
                          pixKeyType === type && styles.pixKeyTypeSelected,
                        ]}
                        onPress={() => {
                          setPixKeyType(type);
                          setPixKey("");
                        }}
                      >
                        <ThemedText
                          type="caption"
                          style={[
                            styles.pixKeyTypeText,
                            pixKeyType === type && styles.pixKeyTypeTextSelected,
                          ]}
                        >
                          {type === "cpf" ? "CPF" : type === "email" ? "E-mail" : type === "celular" ? "Celular" : "Aleatória"}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>

                  <ThemedText type="body" style={styles.formLabel}>
                    {getPixKeyLabel()}
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder={getPixKeyPlaceholder()}
                    placeholderTextColor="#999999"
                    value={pixKey}
                    onChangeText={handlePixKeyChange}
                    keyboardType={pixKeyType === "cpf" || pixKeyType === "celular" ? "numeric" : "default"}
                    autoCapitalize="none"
                    maxLength={pixKeyType === "cpf" ? 14 : pixKeyType === "celular" ? 15 : undefined}
                  />
                </View>
              ) : (
                <View style={styles.formSection}>
                  <ThemedText type="body" style={styles.formLabel}>
                    Número do Cartão
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor="#999999"
                    value={cardNumber}
                    onChangeText={formatCardNumber}
                    keyboardType="numeric"
                    maxLength={19}
                  />

                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <ThemedText type="body" style={styles.formLabel}>
                        Data de Vencimento
                      </ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="MM/AA"
                        placeholderTextColor="#999999"
                        value={cardExpiry}
                        onChangeText={formatExpiry}
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <ThemedText type="body" style={styles.formLabel}>
                        CVV
                      </ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="000"
                        placeholderTextColor="#999999"
                        value={cardCvv}
                        onChangeText={(text) => setCardCvv(text.replace(/\D/g, "").slice(0, 4))}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <ThemedText type="body" style={styles.formLabel}>
                    Nome Completo (como no cartão)
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="NOME COMPLETO"
                    placeholderTextColor="#999999"
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              <View style={styles.totalSection}>
                <ThemedText type="body">Total a pagar:</ThemedText>
                <ThemedText type="h4" style={styles.totalPrice}>
                  {selectedPlan ? formatPrice(plans.find((p) => p.id === selectedPlan)?.price || 0) : "R$ 0,00"}
                </ThemedText>
              </View>

              <Button onPress={handleConfirmPayment} style={styles.confirmButton}>
                OK
              </Button>
            </KeyboardAwareScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: "#666666",
  },
  currentPlanCard: {
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    borderWidth: 2,
    borderColor: Colors.light.success,
  },
  currentPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  currentPlanTitle: {
    marginLeft: Spacing.sm,
    color: Colors.light.success,
  },
  currentPlanType: {
    fontWeight: "600",
  },
  currentPlanDate: {
    color: "#666666",
    marginTop: Spacing.xs,
  },
  cancelSubscriptionButton: {
    backgroundColor: "#FFFFFF",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderBottomWidth: 4,
    borderBottomColor: "#CCCCCC",
    borderRightWidth: 2,
    borderRightColor: "#DDDDDD",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelSubscriptionText: {
    color: "#000000",
    fontWeight: "500",
  },
  planCard: {
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    position: "relative",
    ...Shadows.card,
  },
  planCardSelected: {
    borderColor: Colors.light.primary,
  },
  planCardRecommended: {
    borderColor: Colors.light.accent1,
  },
  recommendedBadge: {
    position: "absolute",
    top: -10,
    right: Spacing.lg,
    backgroundColor: Colors.light.accent1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  recommendedText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  planTitle: {
    marginBottom: Spacing.xs,
  },
  originalPrice: {
    color: "#999999",
    textDecorationLine: "line-through",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  planPrice: {
    color: "#000000",
  },
  planPeriod: {
    color: "#666666",
  },
  planFeatures: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  featureText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  selectIndicator: {
    position: "absolute",
    top: Spacing.xl,
    left: Spacing.xl,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  subscribeButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  disclaimer: {
    textAlign: "center",
    color: "#999999",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.backgroundRoot,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalScroll: {
    padding: Spacing.lg,
  },
  paymentMethodSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  paymentMethodOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundDefault,
    gap: Spacing.sm,
  },
  paymentMethodSelected: {
    borderColor: "#942B18",
    backgroundColor: Colors.light.backgroundRoot,
  },
  paymentMethodText: {
    color: "#666666",
  },
  paymentMethodTextSelected: {
    color: "#942B18",
    fontWeight: "600",
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    backgroundColor: Colors.light.backgroundDefault,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.md,
  },
  pixKeyTypeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pixKeyTypeOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundDefault,
  },
  pixKeyTypeSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  pixKeyTypeText: {
    color: "#666666",
  },
  pixKeyTypeTextSelected: {
    color: Colors.light.buttonText,
    fontWeight: "600",
  },
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: Spacing.md,
  },
  totalPrice: {
    color: "#000000",
  },
  confirmButton: {
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
    elevation: 6,
  },
});
