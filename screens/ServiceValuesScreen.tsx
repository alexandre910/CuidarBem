import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AvailabilityType } from "@/types";

const availabilityOptions: { value: AvailabilityType; label: string }[] = [
  { value: "hora", label: "Hora" },
  { value: "dia", label: "Dia" },
  { value: "mes", label: "Mês" },
];

export default function ServiceValuesScreen() {
  const { user, updateProfile } = useAuth();

  const isProfessional = user?.role === "cuidador" || user?.role === "enfermeiro";

  const [disponibilidade, setDisponibilidade] = useState<AvailabilityType[]>(
    isProfessional && user && "disponibilidade" in user ? user.disponibilidade : []
  );
  const [valorHora, setValorHora] = useState(
    isProfessional && user && "valorHora" in user ? String(user.valorHora || "") : ""
  );
  const [valorDia, setValorDia] = useState(
    isProfessional && user && "valorDia" in user ? String(user.valorDia || "") : ""
  );
  const [valorMensal, setValorMensal] = useState(
    isProfessional && user && "valorMensal" in user ? String(user.valorMensal || "") : ""
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && (user.role === "cuidador" || user.role === "enfermeiro")) {
      if ("disponibilidade" in user) {
        setDisponibilidade(user.disponibilidade || []);
      }
      if ("valorHora" in user) {
        setValorHora(user.valorHora ? String(user.valorHora) : "");
      }
      if ("valorDia" in user) {
        setValorDia(user.valorDia ? String(user.valorDia) : "");
      }
      if ("valorMensal" in user) {
        setValorMensal(user.valorMensal ? String(user.valorMensal) : "");
      }
    }
  }, [user]);

  const toggleAvailability = (type: AvailabilityType) => {
    if (disponibilidade.includes(type)) {
      setDisponibilidade(disponibilidade.filter((d) => d !== type));
    } else {
      setDisponibilidade([...disponibilidade, type]);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const updates: any = {
      disponibilidade,
      valorHora: parseFloat(valorHora) || 0,
      valorDia: parseFloat(valorDia) || 0,
      valorMensal: parseFloat(valorMensal) || 0,
    };

    await updateProfile(updates);
    setSaving(false);
    Alert.alert("Sucesso", "Valores de serviços atualizados com sucesso!");
  };

  if (!isProfessional) {
    return (
      <ScreenKeyboardAwareScrollView>
        <View style={styles.emptyContainer}>
          <Feather name="alert-circle" size={48} color={Colors.light.textSecondary} />
          <ThemedText type="body" style={styles.emptyText}>
            Esta funcionalidade está disponível apenas para cuidadores e enfermeiros.
          </ThemedText>
        </View>
      </ScreenKeyboardAwareScrollView>
    );
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Valores
        </ThemedText>
        <ThemedText type="small" style={styles.sectionDescription}>
          Defina seus valores para cada tipo de serviço
        </ThemedText>

        <Input
          label="Valor por Hora (R$)"
          value={valorHora}
          onChangeText={setValorHora}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />

        <Input
          label="Valor por Dia (R$)"
          value={valorDia}
          onChangeText={setValorDia}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />

        <Input
          label="Valor Mensal (R$)"
          value={valorMensal}
          onChangeText={setValorMensal}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Disponibilidade
        </ThemedText>
        <ThemedText type="small" style={styles.sectionDescription}>
          Selecione os tipos de serviço que você oferece
        </ThemedText>

        <View style={styles.availabilityOptions}>
          {availabilityOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => toggleAvailability(option.value)}
              style={[
                styles.availabilityOption,
                disponibilidade.includes(option.value) && styles.availabilityOptionActive,
              ]}
            >
              <ThemedText
                type="body"
                style={[
                  styles.availabilityText,
                  disponibilidade.includes(option.value) && styles.availabilityTextActive,
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <Button onPress={handleSave} loading={saving} style={styles.saveButton}>
        Salvar Alterações
      </Button>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    color: "#666666",
    marginBottom: Spacing.lg,
  },
  availabilityOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  availabilityOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    backgroundColor: Colors.light.backgroundDefault,
    ...Shadows.card,
  },
  availabilityOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  availabilityText: {
    color: Colors.light.text,
  },
  availabilityTextActive: {
    color: Colors.light.text,
    fontWeight: "600",
  },
  saveButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing["2xl"],
    borderBottomWidth: 4,
    borderBottomColor: "#00C9B7",
    borderRightWidth: 2,
    borderRightColor: "#00C9B7",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.lg,
    color: "#666666",
  },
});
