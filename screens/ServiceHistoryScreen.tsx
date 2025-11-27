import React, { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useData } from "@/context/DataContext";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ServiceHistory } from "@/types";

export default function ServiceHistoryScreen() {
  const { serviceHistory, getUserById, rateService } = useData();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const [ratingModal, setRatingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceHistory | null>(
    null
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  const getStatusLabel = (status: ServiceHistory["status"]) => {
    switch (status) {
      case "active":
        return "Em andamento";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusColor = (status: ServiceHistory["status"]) => {
    switch (status) {
      case "active":
        return Colors.light.accent.blue;
      case "completed":
        return Colors.light.primary;
      case "cancelled":
        return Colors.light.accent.red;
      default:
        return "#666666";
    }
  };

  const handleOpenRating = (service: ServiceHistory) => {
    setSelectedService(service);
    setRating(service.rating || 0);
    setComment(service.ratingComment || "");
    setRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (selectedService && rating > 0) {
      await rateService(selectedService.id, rating, comment);
      setRatingModal(false);
      setSelectedService(null);
      setRating(0);
      setComment("");
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => interactive && setRating(star)}
            disabled={!interactive}
          >
            <Feather
              name="star"
              size={interactive ? 32 : 16}
              color={star <= count ? "#FFD700" : "#CCCCCC"}
              style={{
                marginRight: Spacing.xs,
              }}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: ServiceHistory }) => {
    const professional = getUserById(item.professionalId);

    return (
      <Card style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <ThemedText type="subtitle" style={styles.professionalName}>
            {professional?.nome || "Profissional"}
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

        <View style={styles.cardBody}>
          <ThemedText type="small" style={styles.dateText}>
            {formatDate(item.startDate)}
            {item.endDate ? ` - ${formatDate(item.endDate)}` : ""}
          </ThemedText>

          {item.rating ? (
            <View style={styles.ratingContainer}>
              {renderStars(item.rating)}
              {item.ratingComment ? (
                <ThemedText type="small" style={styles.commentText}>
                  "{item.ratingComment}"
                </ThemedText>
              ) : null}
            </View>
          ) : item.status === "completed" ? (
            <Pressable
              style={styles.rateButton}
              onPress={() => handleOpenRating(item)}
            >
              <Feather name="star" size={16} color={Colors.light.primary} />
              <ThemedText type="small" style={styles.rateButtonText}>
                Avaliar serviço
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop }]}>
      <FlatList
        data={serviceHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: paddingBottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="clock" size={48} color="#CCCCCC" />
            <ThemedText type="body" style={styles.emptyText}>
              Nenhum serviço ainda
            </ThemedText>
            <ThemedText type="small" style={styles.emptySubtext}>
              Seu histórico de serviços contratados aparecerá aqui
            </ThemedText>
          </View>
        }
      />

      <Modal
        visible={ratingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Avaliar Serviço
            </ThemedText>

            <View style={styles.starsContainer}>
              {renderStars(rating, true)}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Deixe um comentário (opcional)"
              placeholderTextColor="#999999"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setRatingModal(false)}
              >
                <ThemedText type="body">Cancelar</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.submitButton,
                  rating === 0 && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitRating}
                disabled={rating === 0}
              >
                <ThemedText type="body" style={styles.submitButtonText}>
                  Enviar
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  historyCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  professionalName: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cardBody: {
    gap: Spacing.sm,
  },
  dateText: {
    color: "#666666",
  },
  ratingContainer: {
    gap: Spacing.xs,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentText: {
    color: "#666666",
    fontStyle: "italic",
  },
  rateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  rateButtonText: {
    color: Colors.light.primary,
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
  starsContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
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
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#000000",
    fontWeight: "600",
  },
});
