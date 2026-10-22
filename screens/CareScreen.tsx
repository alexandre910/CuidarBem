import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { CareCard } from "@/components/CareCard";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

type CareType = "medicamento" | "refeicao" | "consulta" | "exercicio";

const categoryConfig: Record<
  CareType,
  { title: string; icon: keyof typeof Feather.glyphMap; color: string }
> = {
  medicamento: { title: "Medicamentos", icon: "activity", color: Colors.light.accent1 },
  refeicao: { title: "Refeições", icon: "coffee", color: "#942B18" },
  consulta: { title: "Consultas", icon: "calendar", color: Colors.light.accent2 },
  exercicio: { title: "Exercícios", icon: "heart", color: Colors.light.accent1 },
};

export default function CareScreen() {
  const { user } = useAuth();
  const {
    cuidados,
    addMedicamento,
    addRefeicao,
    addConsulta,
    addExercicio,
    deleteMedicamento,
    deleteRefeicao,
    deleteConsulta,
    deleteExercicio,
  } = useData();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<CareType>("medicamento");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (user?.role !== "contratante") {
    return (
      <ScreenScrollView>
        <View style={styles.notAvailable}>
          <Feather name="lock" size={48} color="#CCCCCC" />
          <ThemedText type="body" style={styles.notAvailableText}>
            Esta funcionalidade está disponível apenas para contratantes
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const openAddModal = (type: CareType) => {
    setModalType(type);
    setFormData(type === "medicamento" ? { usoContinuo: "sim" } : {});
    setShowModal(true);
  };

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      switch (modalType) {
        case "medicamento":
          if (!formData.nome || !formData.dosagem) {
            showMessage("Erro", "Preencha nome e dosagem do medicamento");
            setSaving(false);
            return;
          }
          if (
            formData.usoContinuo === "nao" &&
            (!formData.dataInicio?.trim() || !formData.dataTermino?.trim())
          ) {
            showMessage(
              "Erro",
              "Preencha a data de início e a data de término do medicamento.",
            );
            setSaving(false);
            return;
          }
          const usoContinuo = formData.usoContinuo !== "nao";
          await addMedicamento({
            nome: formData.nome,
            dosagem: formData.dosagem,
            horarios: formData.horarios?.split(",").map((h) => h.trim()) || [],
            usoContinuo,
            dataInicio: usoContinuo ? undefined : formData.dataInicio.trim(),
            dataTermino: usoContinuo ? undefined : formData.dataTermino.trim(),
            observacoes: formData.observacoes,
          });
          break;

        case "refeicao":
          if (!formData.tipo || !formData.horario) {
            showMessage("Erro", "Preencha tipo e horário da refeição");
            setSaving(false);
            return;
          }
          await addRefeicao({
            tipo: formData.tipo,
            horario: formData.horario,
            descricao: formData.descricao,
          });
          break;

        case "consulta":
          if (!formData.especialidade || !formData.medico || !formData.data) {
            showMessage("Erro", "Preencha especialidade, médico e data");
            setSaving(false);
            return;
          }
          await addConsulta({
            especialidade: formData.especialidade,
            medico: formData.medico,
            data: formData.data,
            horario: formData.horario || "",
            local: formData.local,
            observacoes: formData.observacoes,
          });
          break;

        case "exercicio":
          if (!formData.tipo || !formData.frequencia) {
            showMessage("Erro", "Preencha tipo e frequência do exercício");
            setSaving(false);
            return;
          }
          await addExercicio({
            tipo: formData.tipo,
            frequencia: formData.frequencia,
            duracao: formData.duracao || "",
            observacoes: formData.observacoes,
          });
          break;
      }

      setShowModal(false);
      setFormData({});
    } catch (error) {
      showMessage("Erro", "Não foi possível salvar");
    }

    setSaving(false);
  };

  const removeCareItem = async (type: CareType, id: string) => {
    try {
      switch (type) {
        case "medicamento":
          await deleteMedicamento(id);
          break;
        case "refeicao":
          await deleteRefeicao(id);
          break;
        case "consulta":
          await deleteConsulta(id);
          break;
        case "exercicio":
          await deleteExercicio(id);
          break;
      }
    } catch (error) {
      console.error("Error deleting care item:", error);
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.alert("Não foi possível excluir este item. Tente novamente.");
      } else {
        Alert.alert("Erro", "Não foi possível excluir este item. Tente novamente.");
      }
    }
  };

  const handleDelete = (type: CareType, id: string) => {
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Deseja remover este item?")
      ) {
        void removeCareItem(type, id);
      }
      return;
    }

    Alert.alert("Confirmar", "Deseja remover este item?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => void removeCareItem(type, id),
      },
    ]);
  };

  const renderModalForm = () => {
    switch (modalType) {
      case "medicamento":
        return (
          <>
            <Input
              label="Nome do Medicamento"
              placeholder="Ex: Losartana"
              value={formData.nome || ""}
              onChangeText={(v) => setFormData({ ...formData, nome: v })}
            />
            <Input
              label="Dosagem"
              placeholder="Ex: 50mg"
              value={formData.dosagem || ""}
              onChangeText={(v) => setFormData({ ...formData, dosagem: v })}
            />
            <Input
              label="Horários (separados por vírgula)"
              placeholder="Ex: 08:00, 20:00"
              value={formData.horarios || ""}
              onChangeText={(v) => setFormData({ ...formData, horarios: v })}
            />
            <Input
              label="Observações"
              placeholder="Observações opcionais"
              value={formData.observacoes || ""}
              onChangeText={(v) => setFormData({ ...formData, observacoes: v })}
              multiline
            />
            <View style={styles.continuousUseSection}>
              <ThemedText type="small" style={styles.continuousUseLabel}>
                Uso contínuo?
              </ThemedText>
              <View style={styles.continuousUseOptions}>
                {(["sim", "nao"] as const).map((value) => {
                  const selected = (formData.usoContinuo || "sim") === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() =>
                        setFormData({ ...formData, usoContinuo: value })
                      }
                      style={[
                        styles.continuousUseOption,
                        selected && styles.continuousUseOptionSelected,
                      ]}
                    >
                      <Feather
                        name={selected ? "check-circle" : "circle"}
                        size={18}
                        color={selected ? Colors.light.accent1 : "#666666"}
                      />
                      <ThemedText type="body" style={styles.continuousUseOptionText}>
                        {value === "sim" ? "Sim" : "Não"}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            {formData.usoContinuo === "nao" ? (
              <>
                <Input
                  label="Data de início"
                  placeholder="DD/MM/AAAA"
                  value={formData.dataInicio || ""}
                  onChangeText={(v) => setFormData({ ...formData, dataInicio: v })}
                />
                <Input
                  label="Data de término"
                  placeholder="DD/MM/AAAA"
                  value={formData.dataTermino || ""}
                  onChangeText={(v) => setFormData({ ...formData, dataTermino: v })}
                />
              </>
            ) : null}
          </>
        );

      case "refeicao":
        return (
          <>
            <Input
              label="Tipo de Refeição"
              placeholder="Ex: Café da Manhã"
              value={formData.tipo || ""}
              onChangeText={(v) => setFormData({ ...formData, tipo: v })}
            />
            <Input
              label="Horário"
              placeholder="Ex: 07:30"
              value={formData.horario || ""}
              onChangeText={(v) => setFormData({ ...formData, horario: v })}
            />
            <Input
              label="Descrição"
              placeholder="Detalhes da refeição"
              value={formData.descricao || ""}
              onChangeText={(v) => setFormData({ ...formData, descricao: v })}
              multiline
            />
          </>
        );

      case "consulta":
        return (
          <>
            <Input
              label="Especialidade"
              placeholder="Ex: Cardiologia"
              value={formData.especialidade || ""}
              onChangeText={(v) => setFormData({ ...formData, especialidade: v })}
            />
            <Input
              label="Médico"
              placeholder="Nome do médico"
              value={formData.medico || ""}
              onChangeText={(v) => setFormData({ ...formData, medico: v })}
            />
            <Input
              label="Data"
              placeholder="Ex: 15/12/2025"
              value={formData.data || ""}
              onChangeText={(v) => setFormData({ ...formData, data: v })}
            />
            <Input
              label="Horário"
              placeholder="Ex: 14:00"
              value={formData.horario || ""}
              onChangeText={(v) => setFormData({ ...formData, horario: v })}
            />
            <Input
              label="Local"
              placeholder="Endereço ou clínica"
              value={formData.local || ""}
              onChangeText={(v) => setFormData({ ...formData, local: v })}
            />
          </>
        );

      case "exercicio":
        return (
          <>
            <Input
              label="Tipo de Exercício"
              placeholder="Ex: Caminhada"
              value={formData.tipo || ""}
              onChangeText={(v) => setFormData({ ...formData, tipo: v })}
            />
            <Input
              label="Frequência"
              placeholder="Ex: 3x por semana"
              value={formData.frequencia || ""}
              onChangeText={(v) => setFormData({ ...formData, frequencia: v })}
            />
            <Input
              label="Duração"
              placeholder="Ex: 30 minutos"
              value={formData.duracao || ""}
              onChangeText={(v) => setFormData({ ...formData, duracao: v })}
            />
            <Input
              label="Observações"
              placeholder="Observações opcionais"
              value={formData.observacoes || ""}
              onChangeText={(v) => setFormData({ ...formData, observacoes: v })}
              multiline
            />
          </>
        );
    }
  };

  return (
    <ScreenScrollView>
      {(["medicamento", "refeicao", "consulta", "exercicio"] as CareType[]).map(
        (type) => {
          const config = categoryConfig[type];
          const items =
            type === "medicamento"
              ? cuidados?.medicamentos || []
              : type === "refeicao"
              ? cuidados?.refeicoes || []
              : type === "consulta"
              ? cuidados?.consultas || []
              : cuidados?.exercicios || [];

          return (
            <View key={type} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleRow}>
                  <Feather name={config.icon} size={20} color={config.color} />
                  <ThemedText type="h4" style={styles.categoryTitle}>
                    {config.title}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => openAddModal(type)}
                  style={[styles.addButton, { backgroundColor: config.color }]}
                >
                  <Feather name="plus" size={18} color="#FFFFFF" />
                </Pressable>
              </View>

              {items.length === 0 ? (
                <View style={styles.emptyCategory}>
                  <ThemedText type="small" style={styles.emptyText}>
                    Nenhum {config.title.toLowerCase().slice(0, -1)} cadastrado
                  </ThemedText>
                </View>
              ) : (
                items.map((item: any) => {
                  let title = "";
                  let subtitle = "";
                  let details: string[] = [];

                  if (type === "medicamento") {
                    title = item.nome;
                    subtitle = item.dosagem;
                    details = item.horarios || [];
                    details = [
                      ...details,
                      `Uso contínuo: ${item.usoContinuo === false ? "Não" : "Sim"}`,
                    ];
                    if (
                      item.usoContinuo === false &&
                      (item.dataInicio || item.dataTermino)
                    ) {
                      details.push(
                        `Período: ${item.dataInicio || "—"} a ${item.dataTermino || "—"}`,
                      );
                    }
                    if (item.observacoes) {
                      details = [...details, `Observações: ${item.observacoes}`];
                    }
                  } else if (type === "refeicao") {
                    title = item.tipo;
                    subtitle = item.horario;
                    if (item.descricao) details = [item.descricao];
                  } else if (type === "consulta") {
                    title = item.especialidade;
                    subtitle = `Dr(a). ${item.medico}`;
                    details = [`${item.data} às ${item.horario}`];
                    if (item.local) details.push(item.local);
                  } else if (type === "exercicio") {
                    title = item.tipo;
                    subtitle = item.frequencia;
                    if (item.duracao) details = [item.duracao];
                    if (item.observacoes) {
                      details = [...details, `Observações: ${item.observacoes}`];
                    }
                  }

                  return (
                    <CareCard
                      key={item.id}
                      type={type}
                      title={title}
                      subtitle={subtitle}
                      details={details}
                      onDelete={() => handleDelete(type, item.id)}
                    />
                  );
                })
              )}
            </View>
          );
        }
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowModal(false)}>
              <ThemedText type="body" style={styles.cancelText}>
                Cancelar
              </ThemedText>
            </Pressable>
            <ThemedText type="h4">
              Adicionar {categoryConfig[modalType].title.slice(0, -1)}
            </ThemedText>
            <Pressable onPress={handleSave} disabled={saving}>
              <ThemedText
                type="body"
                style={[styles.saveText, saving && styles.savingText]}
              >
                {saving ? "Salvando..." : "Salvar"}
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderModalForm()}
          </ScrollView>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  notAvailable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  notAvailableText: {
    marginTop: Spacing.lg,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  categorySection: {
    marginBottom: Spacing["2xl"],
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTitle: {
    marginLeft: Spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCategory: {
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
  },
  emptyText: {
    color: "#999999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  cancelText: {
    color: Colors.light.error,
  },
  saveText: {
    color: Colors.light.accent1,
    fontWeight: "600",
  },
  savingText: {
    opacity: 0.5,
  },
  continuousUseSection: {
    marginBottom: Spacing.lg,
  },
  continuousUseLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  continuousUseOptions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  continuousUseOption: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.backgroundDefault,
  },
  continuousUseOptionSelected: {
    borderColor: Colors.light.accent1,
    borderWidth: 2,
  },
  continuousUseOptionText: {
    fontWeight: "500",
  },
  modalContent: {
    flex: 1,
    padding: Spacing.xl,
  },
});
