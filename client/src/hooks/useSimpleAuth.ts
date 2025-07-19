import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { formatAuthError } from '@/lib/authUtils';

interface SimpleAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface SimpleLoginData {
  email: string;
  password: string;
  tenantId: string;
}

export function useSimpleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SimpleAuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('simple_auth_token')
  );

  const login = async (data: SimpleLoginData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/auth/login', data) as SimpleAuthResponse;
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('simple_auth_token', response.token);
      localStorage.setItem('simple_auth_user', JSON.stringify(response.user));
      
      return response;
    } catch (err) {
      const errorMessage = formatAuthError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('simple_auth_token');
    localStorage.removeItem('simple_auth_user');
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!token && !!user;

  // Inicializar usuario desde localStorage si existe
  useState(() => {
    const savedUser = localStorage.getItem('simple_auth_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Si hay error parseando, limpiar storage
        logout();
      }
    }
  });

  return {
    login,
    logout,
    clearError,
    isLoading,
    error,
    user,
    token,
    isAuthenticated,
  };
}