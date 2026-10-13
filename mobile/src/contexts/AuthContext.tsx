import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'SELLER' | 'COLLECTOR' | 'BUYER' | 'RECYCLER' | 'ADMIN' | string;
  account_status: string;
  verification_status: string;
  preferred_language?: string;
  city?: string;
  locality?: string;
  seller_type?: string;
  business_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    try {
      const token = await storage.getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const profile = await authService.getMe();
      setUser(profile);
    } catch {
      await storage.clearTokens();
      await storage.clearUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authService.login(email, password);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      // Auto-login after registration
      const { user: loggedInUser } = await authService.login(
        String(data.email),
        String(data.password)
      );
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

