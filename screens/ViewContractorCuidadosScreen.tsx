import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useData } from "@/context/DataContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { CuidadoPaciente } from "@/types";
import { ChatStackParamList } from "@/navigation/ChatStackNavigator";

type RouteProps = RouteProp<ChatStackParamList, "ViewContractorCuidados">;

export default function ViewContractorCuidadosScreen() {
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { getCuidadosByContratanteId, getUserById } = useData();
  const [cuidados, setCuidados] = useState<CuidadoPaciente | null>(null);
  const [loading, setLoading] = useState(true);

  const contractor = getUserById(route.params.contratanteId);

  useEffect(() => {
    loadCuidados();
  }, [route.params.contratanteId]);

  const loadCuidados = async () => {
    setLoading(true);
    const data = await getCuidadosByContratanteId(route.params.contratanteId);
    setCuidados(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const hasNoCuidados =
    !cuidados ||
    (cuidados.medicamentos.length === 0 &&
      cuidados.refeicoes.length === 0 &&
      cuidados.consultas.length === 0 &&
      cuidados.exercicios.length === 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing["2xl"] },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Cuidados do Paciente
        </ThemedText>
        <ThemedText type="small" style={styles.headerSubtitle}>
          Contratante: {contractor?.nome || "Não encontrado"}
        </ThemedText>
      </View>

      {hasNoCuidados ? (
        <View style={styles.emptyContainer}>
          <Feather name="clipboard" size={48} color="#999999" />
          <ThemedText type="body" style={styles.emptyText}>
            Nenhum cuidado cadastrado pelo contratante
          </ThemedText>
        </View>
      ) : (
        <>
          {cuidados!.medicamentos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="heart" size={20} color="#DC4429" />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Medicamentos
                </ThemedText>
              </View>
              {cuidados!.medicamentos.map((med) => (
                <View key={med.id} style={styles.card}>
                  <ThemedText type="body" style={styles.cardTitle}>
                    {med.nome}
                  </ThemedText>
                  <ThemedText type="small" style={styles.cardInfo}>
                    Dosagem: {med.dosagem}
                  </ThemedText>
                  <ThemedText type="small" style={styles.cardInfo}>
                    Horários: {med.horarios.join(", ")}
                  </ThemedText>
                  {med.observacoes ? (
                    <ThemedText type="caption" style={styles.cardObs}>
                      Obs: {med.observacoes}
                    </ThemedText>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {cuidados!.refeicoes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="coffee" size={20} color="#942B18" />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Refeições
                </ThemedText>
              </View>
              {cuidados!.refeicoes.map((ref) => (
                <View key={ref.id} style={styles.card}>
                  <ThemedText type="body" style={styles.cardTitle}>
                    {ref.tipo}
                  </ThemedText>
                  <ThemedText type="small" style={styles.cardInfo}>
                    Horário: {ref.horario}
                  </ThemedText>
                  {ref.descricao ? (
                    <ThemedText type="caption" style={styles.cardObs}>
                      {ref.descricao}
                    </ThemedText>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {cuidados!.consultas.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="calendar" size={20} color="#000AFF" />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Consultas
                </ThemedText>
              </View>
              {cuidados!.consultas.map((con) => (
                <View key={con.id} style={styles.card}>
                  <ThemedText type="body" style={styles.cardTitle}>
                    {con.especialidade}
                  </ThemedText>
                  <ThemedText type="small" style={styles.cardInfo}>
                    Médico: {con.medico}
                  </ThemedText>
                  <ThemedText type="small" style={styles.cardInfo}>
                    Data: {con.data} às {con.horario}
                  </ThemedText>
                  {con.local ? (
                    <ThemedText type="small" style={styles.cardInfo}>
                      Local: {con.local}
                    </ThemedText>
                  ) : null}
                  {con.observacoes ? (
                    <ThemedText type="caption" style={styles.cardObs}>
                      Obs: {con.observacoes}
                    </ThemedText>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {cuidados!.exercicios.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="activity" size={20} color="#00FCE3" />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Exercícios
                </ThemedText>
              </View>
              {cuidados!.exercicios.map((exe) => (
                <View key={exe.id} style={styles.card}>
                  <ThemedText type="body" style={styles.cardTitle}>
                    {exe.tipo}
                  </ThemedText>
                  <ThemedText type="small" style={styles.cardInfo}>
                    Frequência: {exe.frequencia}
                  </ThemedText>
                  {exe.duracao ? (
                    <ThemedText type="small" style={styles.cardInfo}>
                      Duração: {exe.duracao}
                    </ThemedText>
                  ) : null}
                  {exe.observacoes ? (
                    <ThemedText type="caption" style={styles.cardObs}>
                      Obs: {exe.observacoes}
                    </ThemedText>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  content: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundRoot,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  headerTitle: {
    color: Colors.light.text,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#666666",
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    color: "#666666",
    textAlign: "center",
    marginTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.light.text,
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.light.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  cardInfo: {
    color: "#666666",
    marginTop: Spacing.xs,
  },
  cardObs: {
    color: "#999999",
    fontStyle: "italic",
    marginTop: Spacing.sm,
  },
});
