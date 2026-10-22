import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Alert, Pressable, Platform } from "react-native";
import type { ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
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
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;
type ProfileRouteProp = RouteProp<ProfileStackParamList, "Profile">;


export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProfileRouteProp>();
  const { user, subscription, updateProfile, logout } = useAuth();
  const { favorites, serviceHistory } = useData();
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedSection, setExpandedSection] = useState<"dados" | null>(null);

  useEffect(() => {
    if (route.params?.openSection === "dados") {
      setExpandedSection("dados");
    }
  }, [route.params?.openSection]);

  const toggleSection = (section: "dados") => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const [nome, setNome] = useState(user?.nome || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [cidade, setCidade] = useState(user?.cidade || "");
  const [foto, setFoto] = useState(user?.foto || "");
  
  const isProfessional = user?.role === "cuidador" || user?.role === "enfermeiro";
  const isEnfermeiro = user?.role === "enfermeiro";
  const [corenDocumento, setCorenDocumento] = useState(
    isEnfermeiro && user && "corenDocumento" in user ? user.corenDocumento || "" : ""
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setTelefone(user.telefone || "");
      setCidade(user.cidade || "");
      setFoto(user.foto || "");
      
      if (user.role === "enfermeiro" && "corenDocumento" in user) {
        setCorenDocumento(user.corenDocumento || "");
      }
    }
  }, [user]);

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

  
  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    
    const updates: any = {
      nome,
      telefone,
      cidade,
      foto,
    };

    const userIsEnfermeiro = user.role === "enfermeiro";

    if (userIsEnfermeiro) {
      updates.corenDocumento = corenDocumento;
    }

    await updateProfile(updates);
    setSaving(false);
    Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
  };

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Tem certeza que deseja sair da sua conta?")
      ) {
        await logout();
      }
      return;
    }

    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => void logout() },
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
          style={[styles.quickActionItem, !isProfessional && styles.quickActionItemLast]}
          onPress={() => toggleSection("dados")}
        >
          <View style={styles.quickActionLeft}>
            <Feather name="user" size={20} color={Colors.light.accent.blue} />
            <ThemedText type="body" style={styles.quickActionText}>
              Dados Pessoais
            </ThemedText>
          </View>
          <Feather 
            name={expandedSection === "dados" ? "chevron-down" : "chevron-right"} 
            size={20} 
            color="#CCCCCC" 
          />
        </Pressable>

        {expandedSection === "dados" ? (
          <View style={styles.expandedSection}>
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
        ) : null}

        {isProfessional ? (
          <Pressable
            style={[styles.quickActionItem, styles.quickActionItemLast]}
            onPress={() => navigation.navigate("ServiceValues")}
          >
            <View style={styles.quickActionLeft}>
              <Feather name="dollar-sign" size={20} color={Colors.light.success} />
              <ThemedText type="body" style={styles.quickActionText}>
                Valores de Serviços
              </ThemedText>
            </View>
            <Feather 
              name="chevron-right" 
              size={20} 
              color="#CCCCCC" 
            />
          </Pressable>
        ) : null}
      </View>

      {isProfessional ? (
        <>
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
  disponibilidadeLabel: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontWeight: "600",
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
  expandedSection: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.light.backgroundDefault,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
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
  contactBanner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing["2xl"],
    alignItems: "center",
  },
  contactBannerInactive: {
    borderColor: "#DC4429",
    backgroundColor: "rgba(220, 68, 41, 0.1)",
  },
  contactBannerActive: {
    borderColor: "#000000",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  contactBannerTitle: {
    color: "#000000",
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  contactBannerTextInactive: {
    color: "#DC4429",
    fontWeight: "600",
    textAlign: "center",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  contactText: {
    color: "#000000",
    fontWeight: "500",
  },
});
