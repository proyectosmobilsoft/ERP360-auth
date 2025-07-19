import { useAuthStore } from '@/store/authStore';
import { LoginRequest, RegisterRequest, MFAVerifyRequest } from '@shared/schema';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    requiresMFA,
    error,
    login,
    register,
    verifyMFA,
    logout,
    refreshAuth,
    clearError,
    setLoading,
  } = useAuthStore();

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      await login(credentials);
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (userData: RegisterRequest) => {
    try {
      await register(userData);
    } catch (error) {
      throw error;
    }
  };

  const handleMFAVerify = async (mfaData: MFAVerifyRequest) => {
    try {
      await verifyMFA(mfaData);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshAuth();
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    requiresMFA,
    error,
    login: handleLogin,
    register: handleRegister,
    verifyMFA: handleMFAVerify,
    logout: handleLogout,
    refreshAuth: handleRefresh,
    clearError,
    setLoading,
  };
};
