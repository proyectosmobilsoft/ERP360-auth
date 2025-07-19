import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse, LoginRequest, RegisterRequest, MFAVerifyRequest } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresMFA: boolean;
  tempToken: string | null;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  verifyMFA: (mfaData: MFAVerifyRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      requiresMFA: false,
      tempToken: null,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiRequest('POST', '/api/auth/login', credentials);
          const data = await response.json();

          if (data.requiresMFA) {
            set({
              requiresMFA: true,
              tempToken: data.tempToken,
              isLoading: false,
            });
          } else {
            const authData: AuthResponse = data;
            set({
              user: authData.user,
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              requiresMFA: false,
              tempToken: null,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiRequest('POST', '/api/auth/register', userData);
          const authData: AuthResponse = await response.json();

          set({
            user: authData.user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      verifyMFA: async (mfaData: MFAVerifyRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiRequest('POST', '/api/auth/mfa/verify', mfaData);
          const authData: AuthResponse = await response.json();

          set({
            user: authData.user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            requiresMFA: false,
            tempToken: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'MFA verification failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await apiRequest('POST', '/api/auth/logout', { refreshToken });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            requiresMFA: false,
            tempToken: null,
            error: null,
          });
        }
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await apiRequest('POST', '/api/auth/refresh', { refreshToken });
          const data = await response.json();

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        } catch (error) {
          // If refresh fails, logout user
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            requiresMFA: false,
            tempToken: null,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
