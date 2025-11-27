import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  planType: "mensal" | "anual";
}

export default function PaymentHistoryScreen() {
  const { subscription } = useAuth();
  const { paddingTop, paddingBottom } = useScreenInsets();

  const generatePaymentHistory = (): PaymentRecord[] => {
    if (!subscription) return [];

    const records: PaymentRecord[] = [];
    const today = new Date();
    const startDate = new Date(subscription.dataInicio);
    const currentDate = new Date(startDate);

    let id = 1;
    while (currentDate <= today && id <= 12) {
      records.push({
        id: `payment_${id}`,
        date: currentDate.toISOString(),
        amount: subscription.valor,
        status: "paid",
        planType: subscription.tipo,
      });

      if (subscription.tipo === "mensal") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
      id++;
    }

    return records.reverse();
  };

  const paymentHistory = generatePaymentHistory();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const getStatusLabel = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      default:
        return status;
    }
  };

  const getStatusColor = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "paid":
        return Colors.light.success;
      case "pending":
        return Colors.light.warning;
      case "failed":
        return Colors.light.error;
      default:
        return "#666666";
    }
  };

  const renderItem = ({ item }: { item: PaymentRecord }) => (
    <Card style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Feather name="credit-card" size={20} color={Colors.light.primary} />
          <View style={styles.cardInfo}>
            <ThemedText type="body" style={styles.planType}>
              Plano {item.planType === "mensal" ? "Mensal" : "Anual"}
            </ThemedText>
            <ThemedText type="small" style={styles.dateText}>
              {formatDate(item.date)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.cardRight}>
          <ThemedText type="body" style={styles.amountText}>
            {formatCurrency(item.amount)}
          </ThemedText>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <ThemedText type="small" style={styles.statusText}>
              {getStatusLabel(item.status)}
            </ThemedText>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop }]}>
      {subscription ? (
        <View style={styles.summaryCard}>
          <ThemedText type="h4" style={styles.summaryTitle}>
            Plano Atual
          </ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText type="body">Tipo:</ThemedText>
            <ThemedText type="body" style={styles.summaryValue}>
              {subscription.tipo === "mensal" ? "Mensal" : "Anual"}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="body">Valor:</ThemedText>
            <ThemedText type="body" style={styles.summaryValue}>
              {formatCurrency(subscription.valor)}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="body">Próx. cobrança:</ThemedText>
            <ThemedText type="body" style={styles.summaryValue}>
              {formatDate(subscription.dataVencimento)}
            </ThemedText>
          </View>
        </View>
      ) : null}

      <ThemedText type="h4" style={styles.historyTitle}>
        Histórico de Pagamentos
      </ThemedText>

      <FlatList
        data={paymentHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: paddingBottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="credit-card" size={48} color="#CCCCCC" />
            <ThemedText type="body" style={styles.emptyText}>
              Nenhum pagamento ainda
            </ThemedText>
            <ThemedText type="small" style={styles.emptySubtext}>
              Seu histórico de pagamentos aparecerá aqui
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
    paddingHorizontal: Spacing.xl,
  },
  summaryCard: {
    backgroundColor: Colors.light.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  summaryTitle: {
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  summaryValue: {
    fontWeight: "600",
  },
  historyTitle: {
    marginBottom: Spacing.md,
  },
  list: {
    paddingTop: Spacing.sm,
  },
  paymentCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  cardInfo: {
    gap: Spacing.xs,
  },
  planType: {
    fontWeight: "500",
  },
  dateText: {
    color: "#666666",
  },
  cardRight: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  amountText: {
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 11,
  },
  emptyContainer: {
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
    paddingHorizontal: Spacing.xl,
  },
});
