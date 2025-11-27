import React, { useState } from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Subscription } from "@/types";

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

export default function SubscriptionScreen() {
  const { user, subscription, updateSubscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setProcessing(true);

    const plan = plans.find((p) => p.id === planId);
    if (!plan || !user) {
      setProcessing(false);
      return;
    }

    const now = new Date();
    const expirationDate = new Date();
    if (planId === "mensal") {
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId: user.id,
      tipo: planId as "mensal" | "anual",
      status: "ativo",
      dataInicio: now.toISOString(),
      dataVencimento: expirationDate.toISOString(),
      valor: plan.price,
    };

    await updateSubscription(newSubscription);
    setProcessing(false);

    Alert.alert(
      "Assinatura Ativada",
      `Seu ${plan.title} foi ativado com sucesso! Válido até ${expirationDate.toLocaleDateString("pt-BR")}.`
    );
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
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

      <Button
        onPress={() => selectedPlan && handleSubscribe(selectedPlan)}
        loading={processing}
        disabled={!selectedPlan || subscription?.status === "ativo"}
        style={styles.subscribeButton}
      >
        {subscription?.status === "ativo"
          ? "Você já possui assinatura ativa"
          : "Assinar Agora"}
      </Button>

      <ThemedText type="caption" style={styles.disclaimer}>
        Pagamento processado de forma segura. Você pode cancelar a qualquer
        momento. Ao assinar, você concorda com nossos Termos de Uso.
      </ThemedText>
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
    color: Colors.light.primary,
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
});
