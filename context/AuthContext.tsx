import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile, UserRole, Subscription } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateSubscription: (subscription: Subscription) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  cidade: string;
  role: UserRole;
  coren?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "@cuidarbem:user",
  SUBSCRIPTION: "@cuidarbem:subscription",
  USERS_DB: "@cuidarbem:users_db",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedSubscription] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION),
      ]);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedSubscription) {
        setSubscription(JSON.parse(storedSubscription));
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersDb = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
      const users = usersDb ? JSON.parse(usersDb) : [];
      
      const foundUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
        
        const subscriptionData = await AsyncStorage.getItem(`@cuidarbem:subscription:${foundUser.id}`);
        if (subscriptionData) {
          const sub = JSON.parse(subscriptionData);
          setSubscription(sub);
          await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const usersDb = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
      const users = usersDb ? JSON.parse(usersDb) : [];

      const existingUser = users.find(
        (u: any) => u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (existingUser) {
        return false;
      }

      const newUser: any = {
        id: `user_${Date.now()}`,
        email: userData.email,
        password: userData.password,
        nome: userData.nome,
        cpfCnpj: userData.cpfCnpj,
        telefone: userData.telefone,
        cidade: userData.cidade,
        role: userData.role,
        createdAt: new Date().toISOString(),
        avaliacaoMedia: 0,
        totalAvaliacoes: 0,
      };

      if (userData.role === "enfermeiro" && userData.coren) {
        newUser.coren = userData.coren;
      }

      if (userData.role === "cuidador" || userData.role === "enfermeiro") {
        newUser.disponibilidade = [];
        newUser.valorHora = 0;
        newUser.valorDia = 0;
        newUser.valorMensal = 0;
      }

      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.SUBSCRIPTION]);
      setUser(null);
      setSubscription(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...data } as UserProfile;
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      const usersDb = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (usersDb) {
        const users = JSON.parse(usersDb);
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...data };
          await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
        }
      }
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  const updateSubscription = async (sub: Subscription) => {
    try {
      setSubscription(sub);
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
      if (user) {
        await AsyncStorage.setItem(`@cuidarbem:subscription:${user.id}`, JSON.stringify(sub));
      }
    } catch (error) {
      console.error("Update subscription error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
