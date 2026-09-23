import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('studymate_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('studymate_token');
      if (token) {
        try {
          const res = await api.getCurrentUser();
          setUser(res.user);
          localStorage.setItem('studymate_user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          api.clearToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      api.setToken(res.token);
      localStorage.setItem('studymate_user', JSON.stringify(res.user));
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      const res = await api.register({ name, email, password, confirmPassword });
      api.setToken(res.token);
      localStorage.setItem('studymate_user', JSON.stringify(res.user));
      setUser(res.user);
      success(`Account created! Welcome to StudyMate AI, ${res.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
