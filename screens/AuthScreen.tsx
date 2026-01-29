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

  const handleRoleChange = (role: UserRole) => {
    if (role !== selectedRole) {
      setNome("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCpfCnpj("");
      setTelefone("");
      setCidade("");
      setCoren("");
      setErrors({});
    }
    setSelectedRole(role);
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    let formatted = numbers;
    if (numbers.length > 3) {
      formatted = numbers.slice(0, 3) + "." + numbers.slice(3);
    }
    if (numbers.length > 6) {
      formatted = numbers.slice(0, 3) + "." + numbers.slice(3, 6) + "." + numbers.slice(6);
    }
    if (numbers.length > 9) {
      formatted = numbers.slice(0, 3) + "." + numbers.slice(3, 6) + "." + numbers.slice(6, 9) + "-" + numbers.slice(9);
    }
    return formatted;
  };

  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 14);
    let formatted = numbers;
    if (numbers.length > 2) {
      formatted = numbers.slice(0, 2) + "." + numbers.slice(2);
    }
    if (numbers.length > 5) {
      formatted = numbers.slice(0, 2) + "." + numbers.slice(2, 5) + "." + numbers.slice(5);
    }
    if (numbers.length > 8) {
      formatted = numbers.slice(0, 2) + "." + numbers.slice(2, 5) + "." + numbers.slice(5, 8) + "/" + numbers.slice(8);
    }
    if (numbers.length > 12) {
      formatted = numbers.slice(0, 2) + "." + numbers.slice(2, 5) + "." + numbers.slice(5, 8) + "/" + numbers.slice(8, 12) + "-" + numbers.slice(12);
    }
    return formatted;
  };

  const handleCpfCnpjChange = (value: string) => {
    if (selectedRole === "empresa") {
      setCpfCnpj(formatCnpj(value));
    } else {
      setCpfCnpj(formatCpf(value));
    }
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "";
    
    const isMobile = numbers.length > 2 && numbers.charAt(2) === "9";
    const maxDigits = isMobile ? 11 : 10;
    const slicedNumbers = numbers.slice(0, maxDigits);
    
    let formatted = "(" + slicedNumbers.slice(0, 2);
    if (slicedNumbers.length > 2) {
      formatted += ")" + slicedNumbers.slice(2);
    }
    if (slicedNumbers.length > 2) {
      if (isMobile) {
        if (slicedNumbers.length > 7) {
          formatted = "(" + slicedNumbers.slice(0, 2) + ")" + slicedNumbers.slice(2, 7) + "-" + slicedNumbers.slice(7);
        }
      } else {
        if (slicedNumbers.length > 6) {
          formatted = "(" + slicedNumbers.slice(0, 2) + ")" + slicedNumbers.slice(2, 6) + "-" + slicedNumbers.slice(6);
        }
      }
    }
    return formatted;
  };

  const handleTelefoneChange = (value: string) => {
    setTelefone(formatTelefone(value));
  };

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "E-mail obrigatório";
    if (!password) newErrors.password = "Senha obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};
    const nomeParts = nome.trim().split(/\s+/).filter(part => part.length > 0);
    if (!nome.trim()) {
      newErrors.nome = "Nome obrigatório";
    } else if (nomeParts.length < 2) {
      newErrors.nome = "Digite seu nome completo (nome e sobrenome)";
    }
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
              placeholder="Nome e sobrenome"
              value={nome}
              onChangeText={setNome}
              onBlur={() => {
                const nomeParts = nome.trim().split(/\s+/).filter(part => part.length > 0);
                if (nome.trim() && nomeParts.length < 2) {
                  setErrors(prev => ({ ...prev, nome: "Digite seu nome completo (nome e sobrenome)" }));
                } else {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.nome;
                    return newErrors;
                  });
                }
              }}
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
                    onPress={() => handleRoleChange(option.value)}
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
              onChangeText={handleCpfCnpjChange}
              error={errors.cpfCnpj}
              leftIcon="file-text"
              keyboardType="numeric"
              maxLength={selectedRole === "empresa" ? 18 : 14}
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
              onChangeText={handleTelefoneChange}
              error={errors.telefone}
              leftIcon="phone"
              keyboardType="phone-pad"
              maxLength={14}
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
    color: "#942B18",
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    color: "#000000",
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
  switchModeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  switchModeText: {
    color: "#000000",
    marginRight: Spacing.xs,
  },
  switchModeLink: {
    fontWeight: "600",
  },
  lgpdText: {
    textAlign: "center",
    color: "#000000",
    marginTop: Spacing["2xl"],
    paddingHorizontal: Spacing.xl,
  },
});
