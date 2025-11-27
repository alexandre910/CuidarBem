import React, { useState } from "react";
import { StyleSheet, View, Alert, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AvailabilityType } from "@/types";

const availabilityOptions: { value: AvailabilityType; label: string }[] = [
  { value: "hora", label: "Hora" },
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

export default function ProfileScreen() {
  const { user, subscription, updateProfile, logout } = useAuth();

  const [nome, setNome] = useState(user?.nome || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [cidade, setCidade] = useState(user?.cidade || "");
  const [foto, setFoto] = useState(user?.foto || "");
  
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

  const pickImage = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Funcionalidade", "Use o Expo Go para capturar fotos.");
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFoto(result.assets[0].uri);
    }
  };

  const toggleAvailability = (type: AvailabilityType) => {
    if (disponibilidade.includes(type)) {
      setDisponibilidade(disponibilidade.filter((d) => d !== type));
    } else {
      setDisponibilidade([...disponibilidade, type]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    const updates: any = {
      nome,
      telefone,
      cidade,
      foto,
    };

    if (isProfessional) {
      updates.disponibilidade = disponibilidade;
      updates.valorHora = parseFloat(valorHora) || 0;
      updates.valorDia = parseFloat(valorDia) || 0;
      updates.valorMensal = parseFloat(valorMensal) || 0;
    }

    await updateProfile(updates);
    setSaving(false);
    Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: logout },
      ]
    );
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { text: "Sem assinatura", color: Colors.light.error };
    switch (subscription.status) {
      case "ativo":
        return { text: "Assinatura Ativa", color: Colors.light.success };
      case "pendente":
        return { text: "Pagamento Pendente", color: Colors.light.warning };
      case "expirado":
        return { text: "Assinatura Expirada", color: Colors.light.error };
      default:
        return { text: "Sem assinatura", color: Colors.light.error };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.photoSection}>
        <Pressable onPress={pickImage} style={styles.photoContainer}>
          <Avatar uri={foto} size={120} role={user?.role} />
          <View style={styles.editPhotoButton}>
            <Feather name="camera" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
        <RoleBadge role={user?.role || "contratante"} size="medium" style={styles.roleBadge} />
      </View>

      <View style={[styles.subscriptionCard, { borderColor: subscriptionStatus.color }]}>
        <View style={styles.subscriptionHeader}>
          <Feather
            name={subscription?.status === "ativo" ? "check-circle" : "alert-circle"}
            size={20}
            color={subscriptionStatus.color}
          />
          <ThemedText type="body" style={[styles.subscriptionText, { color: subscriptionStatus.color }]}>
            {subscriptionStatus.text}
          </ThemedText>
        </View>
        {subscription?.dataVencimento ? (
          <ThemedText type="caption" style={styles.subscriptionDate}>
            Vencimento: {new Date(subscription.dataVencimento).toLocaleDateString("pt-BR")}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Dados Pessoais
        </ThemedText>
        
        <Input
          label="Nome completo"
          value={nome}
          onChangeText={setNome}
          leftIcon="user"
        />

        <Input
          label="E-mail"
          value={user?.email || ""}
          editable={false}
          leftIcon="mail"
          containerStyle={styles.disabledInput}
        />

        <Input
          label="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          leftIcon="phone"
          keyboardType="phone-pad"
        />

        <Input
          label="Cidade"
          value={cidade}
          onChangeText={setCidade}
          leftIcon="map-pin"
        />
      </View>

      {isProfessional ? (
        <>
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Disponibilidade
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

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Valores de Serviço
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
        </>
      ) : null}

      <Button onPress={handleSave} loading={saving} style={styles.saveButton}>
        Salvar Alterações
      </Button>

      <Button
        variant="text"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon={<Feather name="log-out" size={18} color={Colors.light.error} />}
      >
        <ThemedText style={{ color: Colors.light.error }}>Sair da Conta</ThemedText>
      </Button>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  photoContainer: {
    position: "relative",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.light.backgroundRoot,
  },
  roleBadge: {
    marginTop: Spacing.md,
  },
  subscriptionCard: {
    backgroundColor: Colors.light.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing["2xl"],
    ...Shadows.card,
  },
  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscriptionText: {
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  subscriptionDate: {
    marginTop: Spacing.xs,
    marginLeft: 28,
    color: "#666666",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  disabledInput: {
    opacity: 0.6,
  },
  availabilityOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  availabilityOption: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundDefault,
  },
  availabilityOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  availabilityText: {
    fontWeight: "500",
  },
  availabilityTextActive: {
    fontWeight: "600",
  },
  saveButton: {
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    marginBottom: Spacing["3xl"],
  },
});
