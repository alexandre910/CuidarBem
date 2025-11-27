import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

type AuthMode = "login" | "register";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "cuidador", label: "Cuidador" },
  { value: "enfermeiro", label: "Enfermeiro" },
  { value: "contratante", label: "Contratante" },
  { value: "empresa", label: "Empresa" },
];

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [coren, setCoren] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("contratante");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "E-mail obrigatório";
    if (!password) newErrors.password = "Senha obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = "Nome obrigatório";
    if (!email.trim()) newErrors.email = "E-mail obrigatório";
    if (!cpfCnpj.trim()) newErrors.cpfCnpj = "CPF/CNPJ obrigatório";
    if (!telefone.trim()) newErrors.telefone = "Telefone obrigatório";
    if (!cidade.trim()) newErrors.cidade = "Cidade obrigatória";
    if (!password) newErrors.password = "Senha obrigatória";
    if (password.length < 6)
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Senhas não coincidem";
    if (selectedRole === "enfermeiro" && !coren.trim())
      newErrors.coren = "COREN obrigatório para enfermeiros";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      Alert.alert("Erro", "E-mail ou senha incorretos");
    }
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;

    setLoading(true);
    const success = await register({
      email,
      password,
      nome,
      cpfCnpj,
      telefone,
      cidade,
      role: selectedRole,
      coren: selectedRole === "enfermeiro" ? coren : undefined,
    });
    setLoading(false);

    if (!success) {
      Alert.alert("Erro", "Este e-mail já está cadastrado");
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
  };

  const content = (
    <>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h2" style={styles.appName}>
          CuidarBem
        </ThemedText>
        <ThemedText type="body" style={styles.tagline}>
          Cuidados com Carinho
        </ThemedText>
        {mode === "login" ? (
          <ThemedText type="small" style={styles.description}>
            Conectamos famílias a cuidadores e enfermeiros qualificados para
            proporcionar o melhor cuidado aos seus entes queridos.
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.form}>
        {mode === "register" ? (
          <>
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={nome}
              onChangeText={setNome}
              error={errors.nome}
              leftIcon="user"
              autoCapitalize="words"
            />

            <View style={styles.roleSection}>
              <ThemedText type="small" style={styles.roleLabel}>
                Você é:
              </ThemedText>
              <View style={styles.roleOptions}>
                {roleOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelectedRole(option.value)}
                    style={[
                      styles.roleOption,
                      selectedRole === option.value && styles.roleOptionActive,
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={[
                        styles.roleOptionText,
                        selectedRole === option.value &&
                          styles.roleOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <Input
              label={selectedRole === "empresa" ? "CNPJ" : "CPF"}
              placeholder={
                selectedRole === "empresa"
                  ? "00.000.000/0000-00"
                  : "000.000.000-00"
              }
              value={cpfCnpj}
              onChangeText={setCpfCnpj}
              error={errors.cpfCnpj}
              leftIcon="file-text"
              keyboardType="numeric"
            />

            {selectedRole === "enfermeiro" ? (
              <Input
                label="COREN"
                placeholder="COREN-XX 000000"
                value={coren}
                onChangeText={setCoren}
                error={errors.coren}
                leftIcon="award"
              />
            ) : null}

            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChangeText={setTelefone}
              error={errors.telefone}
              leftIcon="phone"
              keyboardType="phone-pad"
            />

            <Input
              label="Cidade"
              placeholder="Sua cidade"
              value={cidade}
              onChangeText={setCidade}
              error={errors.cidade}
              leftIcon="map-pin"
            />
          </>
        ) : null}

        <Input
          label="E-mail"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          leftIcon="mail"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Senha"
          placeholder="Sua senha"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          leftIcon="lock"
        />

        {mode === "register" ? (
          <Input
            label="Confirmar Senha"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            leftIcon="lock"
          />
        ) : null}

        <Button
          onPress={mode === "login" ? handleLogin : handleRegister}
          loading={loading}
          style={styles.submitButton}
        >
          {mode === "login" ? "Entrar" : "Cadastrar"}
        </Button>

        <View style={styles.switchModeContainer}>
          <ThemedText type="small" style={styles.switchModeText}>
            {mode === "login" ? "Não tem conta?" : "Já tem conta?"}
          </ThemedText>
          <Pressable onPress={switchMode}>
            <ThemedText type="link" style={styles.switchModeLink}>
              {mode === "login" ? "Cadastre-se" : "Faça login"}
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="caption" style={styles.lgpdText}>
          Ao continuar, você concorda com nossos Termos de Uso e Política de
          Privacidade, em conformidade com a LGPD.
        </ThemedText>
      </View>
    </>
  );

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.md,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  tagline: {
    color: Colors.light.primary,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    color: "#666666",
    paddingHorizontal: Spacing.xl,
  },
  form: {
    flex: 1,
  },
  roleSection: {
    marginBottom: Spacing.lg,
  },
  roleLabel: {
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  roleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  roleOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundDefault,
  },
  roleOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  roleOptionText: {
    color: Colors.light.text,
  },
  roleOptionTextActive: {
    fontWeight: "600",
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  switchModeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  switchModeText: {
    color: "#666666",
    marginRight: Spacing.xs,
  },
  switchModeLink: {
    fontWeight: "600",
  },
  lgpdText: {
    textAlign: "center",
    color: "#999999",
    marginTop: Spacing["2xl"],
    paddingHorizontal: Spacing.xl,
  },
});
