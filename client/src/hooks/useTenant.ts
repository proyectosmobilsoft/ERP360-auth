import { useTenantStore } from '@/store/tenantStore';
import { useEffect } from 'react';
import { TenantConfig } from '@shared/schema';

export const useTenant = (tenantId?: string) => {
  const {
    tenant,
    tenantId: currentTenantId,
    isLoading,
    error,
    loadTenant,
    setTenantId,
    clearTenant,
  } = useTenantStore();

  useEffect(() => {
    if (tenantId && tenantId !== currentTenantId) {
      loadTenant(tenantId);
    }
  }, [tenantId, currentTenantId, loadTenant]);

  const getTenantConfig = (): TenantConfig => {
    if (tenant?.config) {
      return tenant.config as TenantConfig;
    }
    return {
      welcomeMessage: 'Welcome to our platform',
      ssoProviders: [],
      mfaRequired: false,
    };
  };

  const getTenantLogo = (): string => {
    return tenant?.logo || '';
  };

  const getTenantName = (): string => {
    return tenant?.name || 'Platform';
  };

  const getTenantColors = () => {
    return {
      primary: tenant?.primaryColor || '#1976D2',
      secondary: tenant?.secondaryColor || '#424242',
    };
  };

  return {
    tenant,
    tenantId: currentTenantId,
    isLoading,
    error,
    loadTenant,
    setTenantId,
    clearTenant,
    config: getTenantConfig(),
    logo: getTenantLogo(),
    name: getTenantName(),
    colors: getTenantColors(),
  };
};
