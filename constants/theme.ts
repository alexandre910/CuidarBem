import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    buttonText: "#000000",
    tabIconDefault: "#666666",
    tabIconSelected: "#00FCE3",
    link: "#000AFF",
    backgroundRoot: "#FFFAC7",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    backgroundTertiary: "#E0E0E0",
    primary: "#00FCE3",
    accent1: "#000AFF",
    accent2: "#DC4429",
    accent: {
      blue: "#000AFF",
      red: "#DC4429",
    },
    border: "#E0E0E0",
    starFilled: "#FFD700",
    starEmpty: "#E0E0E0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#DC4429",
    cuidador: "#00FCE3",
    enfermeiro: "#000AFF",
    contratante: "#DC4429",
    empresa: "#666666",
  },
  dark: {
    text: "#000000",
    buttonText: "#000000",
    tabIconDefault: "#666666",
    tabIconSelected: "#00FCE3",
    link: "#000AFF",
    backgroundRoot: "#FFFAC7",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    backgroundTertiary: "#E0E0E0",
    primary: "#00FCE3",
    accent1: "#000AFF",
    accent2: "#DC4429",
    accent: {
      blue: "#000AFF",
      red: "#DC4429",
    },
    border: "#E0E0E0",
    starFilled: "#FFD700",
    starEmpty: "#E0E0E0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#DC4429",
    cuidador: "#00FCE3",
    enfermeiro: "#000AFF",
    contratante: "#DC4429",
    empresa: "#666666",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fab: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

export type UserRole = "cuidador" | "enfermeiro" | "contratante" | "empresa";

export const RoleLabels: Record<UserRole, string> = {
  cuidador: "Cuidador",
  enfermeiro: "Enfermeiro",
  contratante: "Contratante",
  empresa: "Empresa",
};

export const RoleColors: Record<UserRole, string> = {
  cuidador: Colors.light.cuidador,
  enfermeiro: Colors.light.enfermeiro,
  contratante: Colors.light.contratante,
  empresa: Colors.light.empresa,
};
