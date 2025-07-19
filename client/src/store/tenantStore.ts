import { create } from 'zustand';
import { Tenant, TenantConfig } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface TenantState {
  tenant: Tenant | null;
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTenant: (tenantId: string) => Promise<void>;
  setTenantId: (tenantId: string) => void;
  applyTenantTheme: (tenant: Tenant) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenant: null,
  tenantId: null,
  isLoading: false,
  error: null,

  loadTenant: async (tenantId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('GET', `/api/tenant/${tenantId}`);
      const tenant: Tenant = await response.json();
      
      set({ 
        tenant, 
        tenantId, 
        isLoading: false 
      });

      // Apply tenant theme
      get().applyTenantTheme(tenant);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tenant',
        isLoading: false 
      });
      throw error;
    }
  },

  setTenantId: (tenantId: string) => {
    set({ tenantId });
  },

  applyTenantTheme: (tenant: Tenant) => {
    const root = document.documentElement;
    
    if (tenant.primaryColor) {
      // Convert hex to HSL if needed, or use direct HSL values
      root.style.setProperty('--tenant-primary', tenant.primaryColor);
      root.style.setProperty('--primary', tenant.primaryColor);
    }
    
    if (tenant.secondaryColor) {
      root.style.setProperty('--tenant-secondary', tenant.secondaryColor);
      root.style.setProperty('--secondary', tenant.secondaryColor);
    }

    // Apply additional theme configurations
    const config = tenant.config as TenantConfig;
    if (config) {
      // Store config for components to use
      (window as any).__tenantConfig = config;
    }
  },

  clearTenant: () => {
    set({ 
      tenant: null, 
      tenantId: null, 
      error: null 
    });
    
    // Reset theme to defaults
    const root = document.documentElement;
    root.style.removeProperty('--tenant-primary');
    root.style.removeProperty('--tenant-secondary');
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    
    delete (window as any).__tenantConfig;
  },
}));
