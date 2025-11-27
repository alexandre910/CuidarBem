import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { SearchFilters, AvailabilityType } from "@/types";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  initialFilters: SearchFilters;
}

const availabilityOptions: { value: AvailabilityType; label: string }[] = [
  { value: "hora", label: "Por Hora" },
  { value: "dia", label: "Por Dia" },
  { value: "semana", label: "Por Semana" },
  { value: "mes", label: "Por Mês" },
];

const roleOptions: { value: "cuidador" | "enfermeiro" | undefined; label: string }[] = [
  { value: undefined, label: "Todos" },
  { value: "cuidador", label: "Cuidadores" },
  { value: "enfermeiro", label: "Enfermeiros" },
];

export function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const [cidade, setCidade] = useState(initialFilters.cidade || "");
  const [disponibilidade, setDisponibilidade] = useState<AvailabilityType | undefined>(
    initialFilters.disponibilidade
  );
  const [role, setRole] = useState<"cuidador" | "enfermeiro" | undefined>(
    initialFilters.role
  );

  const handleApply = () => {
    onApply({
      cidade: cidade.trim() || undefined,
      disponibilidade,
      role,
    });
    onClose();
  };

  const handleClear = () => {
    setCidade("");
    setDisponibilidade(undefined);
    setRole(undefined);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="h4">Filtros</ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={Colors.light.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Input
            label="Cidade"
            placeholder="Digite a cidade..."
            value={cidade}
            onChangeText={setCidade}
            leftIcon="map-pin"
          />

          <View style={styles.section}>
            <ThemedText type="body" style={styles.sectionTitle}>
              Tipo de Profissional
            </ThemedText>
            <View style={styles.optionsRow}>
              {roleOptions.map((option) => (
                <Pressable
                  key={option.label}
                  onPress={() => setRole(option.value)}
                  style={[
                    styles.optionButton,
                    role === option.value && styles.optionButtonActive,
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={[
                      styles.optionText,
                      role === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="body" style={styles.sectionTitle}>
              Disponibilidade
            </ThemedText>
            <View style={styles.optionsRow}>
              {availabilityOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() =>
                    setDisponibilidade(
                      disponibilidade === option.value ? undefined : option.value
                    )
                  }
                  style={[
                    styles.optionButton,
                    disponibilidade === option.value && styles.optionButtonActive,
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={[
                      styles.optionText,
                      disponibilidade === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="outline" onPress={handleClear} style={styles.clearButton}>
            Limpar
          </Button>
          <Button onPress={handleApply} style={styles.applyButton}>
            Aplicar Filtros
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  optionButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionText: {
    color: Colors.light.text,
  },
  optionTextActive: {
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.md,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
