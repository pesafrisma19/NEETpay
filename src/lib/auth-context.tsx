import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: string;
  hasDynamicAccess: boolean;
  dynamicActivatedAt?: string | null;
  createdAt: string;
  subscription: {
    status: string;
    currentPeriodEnd: string;
    plan: {
      code: string;
      name: string;
      monthlyTransactionLimit: number | null;
      paymentAccountLimit: number;
    };
  } | null;
  apiKey: {
    exists: boolean;
    keyPrefix: string;
    createdAt: string;
    rotatedAt: string | null;
    lastUsedAt: string | null;
  } | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const res = await apiClient<UserProfile>('/api/me');
        return res.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.setQueryData(['auth-me'], null);
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  const user = data || null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        logout: async () => {
          await logoutMutation.mutateAsync();
        },
        refetchUser: () => {
          refetch();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
