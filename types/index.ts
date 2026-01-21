export type UserRole = "cuidador" | "enfermeiro" | "contratante" | "empresa";

export type AvailabilityType = "hora" | "dia" | "semana" | "mes";

export interface User {
  id: string;
  email: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  cidade: string;
  foto?: string;
  role: UserRole;
  createdAt: string;
}

export interface Cuidador extends User {
  role: "cuidador";
  disponibilidade: AvailabilityType[];
  valorHora?: number;
  valorDia?: number;
  valorMensal?: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
}

export interface Enfermeiro extends User {
  role: "enfermeiro";
  coren: string;
  corenDocumento?: string;
  disponibilidade: AvailabilityType[];
  valorHora?: number;
  valorDia?: number;
  valorMensal?: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
}

export interface Contratante extends User {
  role: "contratante";
  fotoIdoso?: string;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
}

export interface Empresa extends User {
  role: "empresa";
  cnpj: string;
}

export type UserProfile = Cuidador | Enfermeiro | Contratante | Empresa;

export interface Subscription {
  id: string;
  userId: string;
  tipo: "mensal" | "anual";
  status: "ativo" | "pendente" | "expirado" | "cancelado";
  dataInicio: string;
  dataVencimento: string;
  valor: number;
}

export interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;
  horarios: string[];
  observacoes?: string;
}

export interface Refeicao {
  id: string;
  tipo: string;
  horario: string;
  descricao?: string;
}

export interface Consulta {
  id: string;
  especialidade: string;
  medico: string;
  data: string;
  horario: string;
  local?: string;
  observacoes?: string;
}

export interface Exercicio {
  id: string;
  tipo: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

export interface CuidadoPaciente {
  id: string;
  contratanteId: string;
  medicamentos: Medicamento[];
  refeicoes: Refeicao[];
  consultas: Consulta[];
  exercicios: Exercicio[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface Avaliacao {
  id: string;
  avaliadorId: string;
  avaliadoId: string;
  nota: number;
  comentario?: string;
  data: string;
}

export interface SearchFilters {
  cidade?: string;
  disponibilidade?: AvailabilityType;
  role?: "cuidador" | "enfermeiro";
}

export interface Favorite {
  professionalId: string;
  addedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
}

export interface ServiceHistory {
  id: string;
  professionalId: string;
  contratanteId: string;
  type: "hour" | "day" | "week" | "month";
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "cancelled";
  rating?: number;
  ratingComment?: string;
  ratedAt?: string;
}
