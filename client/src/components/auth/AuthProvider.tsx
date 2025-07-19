import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { extractTenantId } from '@/lib/tenantUtils';

interface AuthProviderProps {
  children: ReactNode;
  tenantId?: string;
  app?: string;
  module?: string;
}

export function AuthProvider({ 
  children, 
  tenantId: propTenantId,
  app = 'auth',
  module = 'microfrontend'
}: AuthProviderProps) {
  const { refreshAuth, isAuthenticated, user } = useAuth();
  const tenantId = propTenantId || extractTenantId();
  const { loadTenant } = useTenant(tenantId);

  useEffect(() => {
    // Load tenant configuration on mount
    if (tenantId) {
      loadTenant(tenantId);
    }
  }, [tenantId, loadTenant]);

  useEffect(() => {
    // Set up token refresh interval
    let refreshInterval: NodeJS.Timeout;

    if (isAuthenticated && user) {
      // Refresh token every 10 minutes (access token expires in 15 minutes)
      refreshInterval = setInterval(async () => {
        try {
          await refreshAuth();
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, 10 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated, user, refreshAuth]);

  // Store app and module info for context
  useEffect(() => {
    (window as any).__authContext = {
      app,
      module,
      tenantId,
    };
  }, [app, module, tenantId]);

  return <>{children}</>;
}
