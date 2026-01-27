import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  UserProfile, 
  Conversation, 
  Message, 
  CuidadoPaciente, 
  SearchFilters,
  Medicamento,
  Refeicao,
  Consulta,
  Exercicio,
  Cuidador,
  Enfermeiro,
  Favorite,
  Report,
  ServiceHistory,
  Subscription
} from "@/types";
import { useAuth } from "./AuthContext";

interface DataContextType {
  professionals: (Cuidador | Enfermeiro)[];
  conversations: Conversation[];
  cuidados: CuidadoPaciente | null;
  favorites: string[];
  serviceHistory: ServiceHistory[];
  searchProfessionals: (filters: SearchFilters) => (Cuidador | Enfermeiro)[];
  getMessages: (conversationId: string) => Promise<Message[]>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  startConversation: (recipientId: string) => Promise<string>;
  deleteConversation: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  updateCuidados: (data: Partial<CuidadoPaciente>) => Promise<void>;
  addMedicamento: (med: Omit<Medicamento, "id">) => Promise<void>;
  addRefeicao: (ref: Omit<Refeicao, "id">) => Promise<void>;
  addConsulta: (con: Omit<Consulta, "id">) => Promise<void>;
  addExercicio: (exe: Omit<Exercicio, "id">) => Promise<void>;
  deleteMedicamento: (id: string) => Promise<void>;
  deleteRefeicao: (id: string) => Promise<void>;
  deleteConsulta: (id: string) => Promise<void>;
  deleteExercicio: (id: string) => Promise<void>;
  getUserById: (id: string) => UserProfile | undefined;
  refreshData: () => Promise<void>;
  toggleFavorite: (professionalId: string) => Promise<void>;
  isFavorite: (professionalId: string) => boolean;
  getFavorites: () => (Cuidador | Enfermeiro)[];
  reportProfile: (reportedId: string, reason: string, description?: string) => Promise<void>;
  addServiceHistory: (history: Omit<ServiceHistory, "id">) => Promise<void>;
  rateService: (serviceId: string, rating: number, comment?: string) => Promise<void>;
  rateProfessional: (professionalId: string, rating: number) => Promise<void>;
  getUserRating: (professionalId: string) => number | null;
  getSubscriptionByUserId: (userId: string) => Promise<Subscription | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONVERSATIONS: "@cuidarbem:conversations",
  MESSAGES: "@cuidarbem:messages",
  CUIDADOS: "@cuidarbem:cuidados",
  USERS_DB: "@cuidarbem:users_db",
  FAVORITES: "@cuidarbem:favorites",
  REPORTS: "@cuidarbem:reports",
  SERVICE_HISTORY: "@cuidarbem:service_history",
  PROFESSIONAL_RATINGS: "@cuidarbem:professional_ratings",
};

interface ProfessionalRating {
  professionalId: string;
  rating: number;
  ratedAt: string;
}

const mockProfessionals: (Cuidador | Enfermeiro)[] = [
  {
    id: "prof_1",
    email: "maria.cuidadora@email.com",
    nome: "Maria Santos",
    cpfCnpj: "123.456.789-00",
    telefone: "(11) 99999-1111",
    cidade: "São Paulo",
    role: "cuidador",
    disponibilidade: ["hora", "dia"],
    valorHora: 50,
    valorDia: 350,
    valorMensal: 5000,
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prof_2",
    email: "joao.enfermeiro@email.com",
    nome: "João Silva",
    cpfCnpj: "987.654.321-00",
    telefone: "(11) 99999-2222",
    cidade: "São Paulo",
    role: "enfermeiro",
    coren: "COREN-SP 123456",
    disponibilidade: ["dia", "mes"],
    valorHora: 80,
    valorDia: 500,
    valorMensal: 8000,
    avaliacaoMedia: 4.9,
    totalAvaliacoes: 67,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prof_3",
    email: "ana.cuidadora@email.com",
    nome: "Ana Oliveira",
    cpfCnpj: "456.789.123-00",
    telefone: "(21) 99999-3333",
    cidade: "Rio de Janeiro",
    role: "cuidador",
    disponibilidade: ["hora", "dia", "semana"],
    valorHora: 45,
    valorDia: 300,
    valorMensal: 4500,
    avaliacaoMedia: 4.6,
    totalAvaliacoes: 32,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prof_4",
    email: "carlos.enfermeiro@email.com",
    nome: "Carlos Mendes",
    cpfCnpj: "321.654.987-00",
    telefone: "(31) 99999-4444",
    cidade: "Belo Horizonte",
    role: "enfermeiro",
    coren: "COREN-MG 654321",
    disponibilidade: ["hora", "dia", "mes"],
    valorHora: 75,
    valorDia: 450,
    valorMensal: 7500,
    avaliacaoMedia: 4.7,
    totalAvaliacoes: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prof_5",
    email: "lucia.cuidadora@email.com",
    nome: "Lucia Ferreira",
    cpfCnpj: "789.123.456-00",
    telefone: "(11) 99999-5555",
    cidade: "São Paulo",
    role: "cuidador",
    disponibilidade: ["mes"],
    valorHora: 55,
    valorDia: 380,
    valorMensal: 5500,
    avaliacaoMedia: 4.5,
    totalAvaliacoes: 19,
    createdAt: new Date().toISOString(),
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<(Cuidador | Enfermeiro)[]>(mockProfessionals);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [cuidados, setCuidados] = useState<CuidadoPaciente | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [userRatings, setUserRatings] = useState<ProfessionalRating[]>([]);

  useEffect(() => {
    const initializeMockSubscriptions = async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      for (const prof of mockProfessionals) {
        const key = `@cuidarbem:subscription:${prof.id}`;
        const existing = await AsyncStorage.getItem(key);
        if (!existing) {
          const mockSubscription = {
            id: `sub_${prof.id}`,
            plano: "mensal",
            valor: 49.90,
            dataInicio: new Date().toISOString(),
            dataVencimento: futureDate.toISOString(),
            status: "ativo",
            metodoPagamento: "pix",
          };
          await AsyncStorage.setItem(key, JSON.stringify(mockSubscription));
        }
      }
    };
    initializeMockSubscriptions();
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadCuidados();
      loadAllUsers();
      loadFavorites();
      loadServiceHistory();
      loadUserRatings();
    } else {
      // Clear all user-specific data on logout
      setConversations([]);
      setCuidados(null);
      setFavorites([]);
      setServiceHistory([]);
      setUserRatings([]);
    }
  }, [user]);

  const loadAllUsers = async () => {
    try {
      const usersDb = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (usersDb) {
        const users = JSON.parse(usersDb).map((u: any) => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword;
        });
        setAllUsers(users);
        
        const registeredProfessionals = users.filter(
          (u: UserProfile) => (u.role === "cuidador" || u.role === "enfermeiro")
        );
        setProfessionals([...mockProfessionals, ...registeredProfessionals]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadConversations = async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.CONVERSATIONS}:${user.id}`);
      // Always set conversations - either from storage or empty array
      setConversations(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    }
  };

  const loadCuidados = async () => {
    if (!user || user.role !== "contratante") return;
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.CUIDADOS}:${user.id}`);
      if (stored) {
        setCuidados(JSON.parse(stored));
      } else {
        const initial: CuidadoPaciente = {
          id: `cuidado_${user.id}`,
          contratanteId: user.id,
          medicamentos: [],
          refeicoes: [],
          consultas: [],
          exercicios: [],
        };
        setCuidados(initial);
        await AsyncStorage.setItem(`${STORAGE_KEYS.CUIDADOS}:${user.id}`, JSON.stringify(initial));
      }
    } catch (error) {
      console.error("Error loading cuidados:", error);
    }
  };

  const searchProfessionals = (filters: SearchFilters): (Cuidador | Enfermeiro)[] => {
    return professionals.filter((prof) => {
      if (filters.role && prof.role !== filters.role) return false;
      if (filters.cidade && !prof.cidade.toLowerCase().includes(filters.cidade.toLowerCase())) return false;
      if (filters.disponibilidade && !prof.disponibilidade.includes(filters.disponibilidade)) return false;
      return true;
    });
  };

  const getMessages = async (conversationId: string): Promise<Message[]> => {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.MESSAGES}:${conversationId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  };

  const sendMessage = async (conversationId: string, text: string) => {
    if (!user) return;
    try {
      const message: Message = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId: user.id,
        text,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.MESSAGES}:${conversationId}`);
      const messages = stored ? JSON.parse(stored) : [];
      messages.push(message);
      await AsyncStorage.setItem(`${STORAGE_KEYS.MESSAGES}:${conversationId}`, JSON.stringify(messages));

      const convIndex = conversations.findIndex((c) => c.id === conversationId);
      if (convIndex !== -1) {
        const currentConv = conversations[convIndex];
        const updatedConv = {
          ...currentConv,
          lastMessage: message,
          updatedAt: message.timestamp,
        };
        
        const updatedConversations = [...conversations];
        updatedConversations[convIndex] = updatedConv;
        setConversations(updatedConversations);
        await AsyncStorage.setItem(
          `${STORAGE_KEYS.CONVERSATIONS}:${user.id}`,
          JSON.stringify(updatedConversations)
        );

        // Also update conversation for the other participant
        const otherUserId = currentConv.participants.find((p) => p !== user.id);
        if (otherUserId) {
          try {
            const otherStoredConvs = await AsyncStorage.getItem(`${STORAGE_KEYS.CONVERSATIONS}:${otherUserId}`);
            if (otherStoredConvs) {
              const otherConversations: Conversation[] = JSON.parse(otherStoredConvs);
              const otherConvIndex = otherConversations.findIndex((c) => c.id === conversationId);
              if (otherConvIndex !== -1) {
                otherConversations[otherConvIndex] = updatedConv;
                await AsyncStorage.setItem(
                  `${STORAGE_KEYS.CONVERSATIONS}:${otherUserId}`,
                  JSON.stringify(otherConversations)
                );
              }
            }
          } catch (error) {
            console.error("Error updating conversation for other user:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const startConversation = async (recipientId: string): Promise<string> => {
    if (!user) return "";

    // Check if both users are professionals (cuidador or enfermeiro)
    const recipient = getUserById(recipientId);
    const senderIsProfessional = user.role === "cuidador" || user.role === "enfermeiro";
    const recipientIsProfessional = recipient?.role === "cuidador" || recipient?.role === "enfermeiro";
    
    // Block professional-to-professional messaging
    if (senderIsProfessional && recipientIsProfessional) {
      console.log("Messaging between professionals is not allowed");
      return "";
    }
    
    const existingConv = conversations.find(
      (c) => c.participants.includes(recipientId) && c.participants.includes(user.id)
    );
    
    if (existingConv) return existingConv.id;

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      participants: [user.id, recipientId],
      updatedAt: new Date().toISOString(),
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CONVERSATIONS}:${user.id}`,
      JSON.stringify(updatedConversations)
    );

    // Also save conversation for the recipient
    try {
      const recipientStoredConvs = await AsyncStorage.getItem(`${STORAGE_KEYS.CONVERSATIONS}:${recipientId}`);
      const recipientConversations: Conversation[] = recipientStoredConvs ? JSON.parse(recipientStoredConvs) : [];
      
      // Check if recipient already has this conversation
      const recipientHasConv = recipientConversations.find(
        (c) => c.participants.includes(user.id) && c.participants.includes(recipientId)
      );
      
      if (!recipientHasConv) {
        recipientConversations.push(newConversation);
        await AsyncStorage.setItem(
          `${STORAGE_KEYS.CONVERSATIONS}:${recipientId}`,
          JSON.stringify(recipientConversations)
        );
      }
    } catch (error) {
      console.error("Error saving conversation for recipient:", error);
    }

    return newConversation.id;
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;
    try {
      const updatedConversations = conversations.filter((c) => c.id !== conversationId);
      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.CONVERSATIONS}:${user.id}`,
        JSON.stringify(updatedConversations)
      );

      // Also delete messages for this conversation
      await AsyncStorage.removeItem(`${STORAGE_KEYS.MESSAGES}:${conversationId}`);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const updateCuidados = async (data: Partial<CuidadoPaciente>) => {
    if (!user || !cuidados) return;
    const updated = { ...cuidados, ...data };
    setCuidados(updated);
    await AsyncStorage.setItem(`${STORAGE_KEYS.CUIDADOS}:${user.id}`, JSON.stringify(updated));
  };

  const addMedicamento = async (med: Omit<Medicamento, "id">) => {
    if (!cuidados) return;
    const newMed = { ...med, id: `med_${Date.now()}` };
    await updateCuidados({ medicamentos: [...cuidados.medicamentos, newMed] });
  };

  const addRefeicao = async (ref: Omit<Refeicao, "id">) => {
    if (!cuidados) return;
    const newRef = { ...ref, id: `ref_${Date.now()}` };
    await updateCuidados({ refeicoes: [...cuidados.refeicoes, newRef] });
  };

  const addConsulta = async (con: Omit<Consulta, "id">) => {
    if (!cuidados) return;
    const newCon = { ...con, id: `con_${Date.now()}` };
    await updateCuidados({ consultas: [...cuidados.consultas, newCon] });
  };

  const addExercicio = async (exe: Omit<Exercicio, "id">) => {
    if (!cuidados) return;
    const newExe = { ...exe, id: `exe_${Date.now()}` };
    await updateCuidados({ exercicios: [...cuidados.exercicios, newExe] });
  };

  const deleteMedicamento = async (id: string) => {
    if (!cuidados) return;
    await updateCuidados({ medicamentos: cuidados.medicamentos.filter((m) => m.id !== id) });
  };

  const deleteRefeicao = async (id: string) => {
    if (!cuidados) return;
    await updateCuidados({ refeicoes: cuidados.refeicoes.filter((r) => r.id !== id) });
  };

  const deleteConsulta = async (id: string) => {
    if (!cuidados) return;
    await updateCuidados({ consultas: cuidados.consultas.filter((c) => c.id !== id) });
  };

  const deleteExercicio = async (id: string) => {
    if (!cuidados) return;
    await updateCuidados({ exercicios: cuidados.exercicios.filter((e) => e.id !== id) });
  };

  const getUserById = (id: string): UserProfile | undefined => {
    const fromProfessionals = professionals.find((p) => p.id === id);
    if (fromProfessionals) return fromProfessionals;
    return allUsers.find((u) => u.id === id);
  };

  const refreshData = async () => {
    await loadAllUsers();
    await loadConversations();
    await loadCuidados();
    await loadFavorites();
    await loadServiceHistory();
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.FAVORITES}:${user.id}`);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (professionalId: string) => {
    if (!user) return;
    try {
      let newFavorites: string[];
      if (favorites.includes(professionalId)) {
        newFavorites = favorites.filter((id) => id !== professionalId);
      } else {
        newFavorites = [...favorites, professionalId];
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.FAVORITES}:${user.id}`,
        JSON.stringify(newFavorites)
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const isFavorite = (professionalId: string): boolean => {
    return favorites.includes(professionalId);
  };

  const getFavorites = (): (Cuidador | Enfermeiro)[] => {
    return professionals.filter((p) => favorites.includes(p.id));
  };

  const reportProfile = async (reportedId: string, reason: string, description?: string) => {
    if (!user) return;
    try {
      const report: Report = {
        id: `report_${Date.now()}`,
        reporterId: user.id,
        reportedId,
        reason,
        description,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
      const reports = stored ? JSON.parse(stored) : [];
      reports.push(report);
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (error) {
      console.error("Error reporting profile:", error);
    }
  };

  const loadServiceHistory = async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.SERVICE_HISTORY}:${user.id}`);
      if (stored) {
        setServiceHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading service history:", error);
    }
  };

  const addServiceHistory = async (history: Omit<ServiceHistory, "id">) => {
    if (!user) return;
    try {
      const newHistory: ServiceHistory = {
        ...history,
        id: `service_${Date.now()}`,
      };
      const updated = [...serviceHistory, newHistory];
      setServiceHistory(updated);
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.SERVICE_HISTORY}:${user.id}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Error adding service history:", error);
    }
  };

  const rateService = async (serviceId: string, rating: number, comment?: string) => {
    if (!user) return;
    try {
      const updated = serviceHistory.map((h) => {
        if (h.id === serviceId) {
          return {
            ...h,
            rating,
            ratingComment: comment,
            ratedAt: new Date().toISOString(),
          };
        }
        return h;
      });
      setServiceHistory(updated);
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.SERVICE_HISTORY}:${user.id}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Error rating service:", error);
    }
  };

  const loadUserRatings = async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.PROFESSIONAL_RATINGS}:${user.id}`);
      if (stored) {
        setUserRatings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading user ratings:", error);
    }
  };

  const rateProfessional = async (professionalId: string, rating: number) => {
    if (!user) return;
    try {
      const existingIndex = userRatings.findIndex((r) => r.professionalId === professionalId);
      let updatedRatings: ProfessionalRating[];
      
      if (existingIndex !== -1) {
        updatedRatings = userRatings.map((r, i) =>
          i === existingIndex
            ? { ...r, rating, ratedAt: new Date().toISOString() }
            : r
        );
      } else {
        const newRating: ProfessionalRating = {
          professionalId,
          rating,
          ratedAt: new Date().toISOString(),
        };
        updatedRatings = [...userRatings, newRating];
      }
      
      setUserRatings(updatedRatings);
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.PROFESSIONAL_RATINGS}:${user.id}`,
        JSON.stringify(updatedRatings)
      );

      // Update professional's average rating
      const allRatingsStored = await AsyncStorage.getItem(STORAGE_KEYS.PROFESSIONAL_RATINGS);
      let allUserRatings: { [userId: string]: ProfessionalRating[] } = {};
      
      if (allRatingsStored) {
        allUserRatings = JSON.parse(allRatingsStored);
      }
      allUserRatings[user.id] = updatedRatings;
      await AsyncStorage.setItem(STORAGE_KEYS.PROFESSIONAL_RATINGS, JSON.stringify(allUserRatings));

      // Calculate new average for the professional
      let totalRating = 0;
      let totalCount = 0;
      Object.values(allUserRatings).forEach((ratings) => {
        const profRating = ratings.find((r) => r.professionalId === professionalId);
        if (profRating) {
          totalRating += profRating.rating;
          totalCount++;
        }
      });

      if (totalCount > 0) {
        const newAverage = totalRating / totalCount;
        setProfessionals((prev) =>
          prev.map((p) =>
            p.id === professionalId
              ? { ...p, avaliacaoMedia: newAverage, totalAvaliacoes: totalCount }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error rating professional:", error);
    }
  };

  const getUserRating = (professionalId: string): number | null => {
    const rating = userRatings.find((r) => r.professionalId === professionalId);
    return rating ? rating.rating : null;
  };

  const getSubscriptionByUserId = async (userId: string): Promise<Subscription | null> => {
    try {
      const subscriptionData = await AsyncStorage.getItem(`@cuidarbem:subscription:${userId}`);
      if (subscriptionData) {
        const sub = JSON.parse(subscriptionData);
        if (sub.status === "ativo" && new Date(sub.dataVencimento) > new Date()) {
          return sub;
        }
      }
      return null;
    } catch (error) {
      console.error("Get subscription error:", error);
      return null;
    }
  };

  return (
    <DataContext.Provider
      value={{
        professionals,
        conversations,
        cuidados,
        favorites,
        serviceHistory,
        searchProfessionals,
        getMessages,
        sendMessage,
        startConversation,
        deleteConversation,
        loadConversations,
        updateCuidados,
        addMedicamento,
        addRefeicao,
        addConsulta,
        addExercicio,
        deleteMedicamento,
        deleteRefeicao,
        deleteConsulta,
        deleteExercicio,
        getUserById,
        refreshData,
        toggleFavorite,
        isFavorite,
        getFavorites,
        reportProfile,
        addServiceHistory,
        rateService,
        rateProfessional,
        getUserRating,
        getSubscriptionByUserId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
