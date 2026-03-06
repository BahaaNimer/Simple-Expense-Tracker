'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type AuthUser } from '../lib/api';
import { setAuthToken } from '../lib/api';
import { TOKEN_KEY, USER_KEY } from '../constants/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
}

function clearUserDataCache(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({ queryKey: ['transactions'] });
  queryClient.removeQueries({ queryKey: ['transaction'] });
  queryClient.removeQueries({ queryKey: ['categories'] });
  queryClient.removeQueries({ queryKey: ['budgets'] });
  queryClient.removeQueries({ queryKey: ['budget-usage'] });
  queryClient.removeQueries({ queryKey: ['reference-prefixes'] });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;

    if (!token || !stored) {
      setIsLoading(false);
      return;
    }

    let parsed: AuthUser;
    try {
      parsed = JSON.parse(stored) as AuthUser;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setIsLoading(false);
      return;
    }

    setAuthToken(token);
    api.categories
      .list()
      .then(() => {
        setUser(parsed);
        setIsLoading(false);
      })
      .catch(() => {
        setAuthToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setAuthToken(res.access_token);
    setUser(res.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    clearUserDataCache(queryClient);
  }, [queryClient]);

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.auth.register({ email, password });
    setAuthToken(res.access_token);
    setUser(res.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    clearUserDataCache(queryClient);
  }, [queryClient]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    clearUserDataCache(queryClient);
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
