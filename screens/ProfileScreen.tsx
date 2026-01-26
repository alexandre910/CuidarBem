import React, { useState, useRef } from "react";
import { StyleSheet, View, Alert, Pressable, Platform } from "react-native";
import type { ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AvailabilityType } from "@/types";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const availabilityOptions: { value: AvailabilityType; label: string }[] = [
  { value: "hora", label: "Hora" },
  { value: "dia", label: "Dia" },
  { value: "mes", label: "Mês" },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, subscription, updateProfile, logout } = useAuth();
  const { favorites, serviceHistory } = useData();
  const scrollViewRef = useRef<ScrollView>(null);
  const [dadosPessoaisY, setDadosPessoaisY] = useState(0);

  const [nome, setNome] = useState(user?.nome || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [cidade, setCidade] = useState(user?.cidade || "");
  const [foto, setFoto] = useState(user?.foto || "");
  
  const isProfessional = user?.role === "cuidador" || user?.role === "enfermeiro";
  const isEnfermeiro = user?.role === "enfermeiro";
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
  const [corenDocumento, setCorenDocumento] = useState(
    isEnfermeiro && user && "corenDocumento" in user ? user.corenDocumento || "" : ""
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

  const pickCorenDocument = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Funcionalidade", "Use o Expo Go para enviar documentos.");
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setCorenDocumento(result.assets[0].uri);
      Alert.alert("Documento Enviado", "Foto do documento COREN adicionada com sucesso.");
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

    if (isEnfermeiro) {
      updates.corenDocumento = corenDocumento;
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
    <ScreenKeyboardAwareScrollView ref={scrollViewRef}>
      <View style={styles.photoSection}>
        <Pressable onPress={pickImage} style={styles.photoContainer}>
          <Avatar uri={foto} size={120} role={user?.role} />
          <View style={styles.editPhotoButton}>
            <Feather name="camera" size={16} color="#000000" />
          </View>
        </Pressable>
        <RoleBadge role={user?.role || "contratante"} size="medium" style={styles.roleBadge} />
      </View>

      <Pressable 
        style={[styles.subscriptionCard, { borderColor: subscriptionStatus.color }]}
        onPress={() => navigation.navigate("Subscription")}
      >
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
      </Pressable>

      <View style={styles.quickActions}>
        <Pressable
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Favorites")}
        >
          <View style={styles.quickActionLeft}>
            <Feather name="heart" size={20} color={Colors.light.accent.red} />
            <ThemedText type="body" style={styles.quickActionText}>
              Favoritos
            </ThemedText>
          </View>
          <View style={styles.quickActionRight}>
            <ThemedText type="small" style={styles.quickActionCount}>
              {favorites.length}
            </ThemedText>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </View>
        </Pressable>

        <Pressable
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("ServiceHistory")}
        >
          <View style={styles.quickActionLeft}>
            <Feather name="clock" size={20} color={Colors.light.accent.blue} />
            <ThemedText type="body" style={styles.quickActionText}>
              Histórico de Serviços
            </ThemedText>
          </View>
          <View style={styles.quickActionRight}>
            <ThemedText type="small" style={styles.quickActionCount}>
              {serviceHistory.length}
            </ThemedText>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </View>
        </Pressable>

        <Pressable
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Subscription")}
        >
          <View style={styles.quickActionLeft}>
            <Feather name="credit-card" size={20} color={Colors.light.primary} />
            <ThemedText type="body" style={styles.quickActionText}>
              Gerenciar Assinatura
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#CCCCCC" />
        </Pressable>

        <Pressable
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("PaymentHistory")}
        >
          <View style={styles.quickActionLeft}>
            <Feather name="file-text" size={20} color="#666666" />
            <ThemedText type="body" style={styles.quickActionText}>
              Histórico de Pagamentos
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#CCCCCC" />
        </Pressable>

        <Pressable
          style={[styles.quickActionItem, styles.quickActionItemLast]}
          onPress={() => scrollViewRef.current?.scrollTo({ y: dadosPessoaisY, animated: true })}
        >
          <View style={styles.quickActionLeft}>
            <Feather name="user" size={20} color={Colors.light.accent.blue} />
            <ThemedText type="body" style={styles.quickActionText}>
              Dados Pessoais
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#CCCCCC" />
        </Pressable>
      </View>

      <View 
        style={styles.section}
        onLayout={(event) => setDadosPessoaisY(event.nativeEvent.layout.y)}
      >
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

          {isEnfermeiro ? (
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Documento COREN
              </ThemedText>
              <ThemedText type="small" style={styles.sectionDescription}>
                Envie uma foto do seu registro COREN para verificação
              </ThemedText>
              <Pressable
                style={styles.documentUpload}
                onPress={pickCorenDocument}
              >
                {corenDocumento ? (
                  <View style={styles.documentUploaded}>
                    <Feather name="check-circle" size={24} color={Colors.light.success} />
                    <ThemedText type="body" style={styles.documentText}>
                      Documento enviado
                    </ThemedText>
                    <ThemedText type="small" style={styles.changeDocumentText}>
                      Toque para alterar
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.documentEmpty}>
                    <Feather name="upload" size={24} color="#666666" />
                    <ThemedText type="body" style={styles.documentText}>
                      Enviar foto do COREN
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}

      <Button onPress={handleSave} loading={saving} style={styles.saveButton}>
        Salvar Alterações
      </Button>

      <Button
        variant="text"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon={<Feather name="log-out" size={18} color="#942B18" />}
      >
        <ThemedText style={{ color: "#942B18", fontWeight: "600" }}>Sair da Conta</ThemedText>
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
  logoutButton: {
    marginBottom: Spacing["3xl"],
  },
  quickActions: {
    backgroundColor: Colors.light.backgroundDefault,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    ...Shadows.card,
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  quickActionItemLast: {
    borderBottomWidth: 0,
  },
  quickActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  quickActionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  quickActionText: {
    fontWeight: "500",
  },
  quickActionCount: {
    color: "#666666",
  },
  sectionDescription: {
    color: "#666666",
    marginBottom: Spacing.md,
  },
  documentUpload: {
    backgroundColor: Colors.light.backgroundDefault,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  documentUploaded: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  documentEmpty: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  documentText: {
    fontWeight: "500",
    textAlign: "center",
  },
  changeDocumentText: {
    color: Colors.light.primary,
  },
});
