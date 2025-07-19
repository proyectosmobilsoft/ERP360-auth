import { TenantConfig } from '@shared/schema';

export function getTenantIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('tenant');
}

export function getTenantIdFromSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Skip if it's localhost, IP address, or replit-related domain
  if (hostname.includes('localhost') || 
      hostname.includes('127.0.0.1') || 
      hostname.includes('replit') ||
      hostname.includes('.app') ||
      /^\d+\.\d+\.\d+\.\d+/.test(hostname) ||
      parts[0].length > 20) { // Skip very long UUIDs
    return null;
  }
  
  // Check if it's a subdomain pattern (tenant.domain.com)
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }
  
  return null;
}

export function extractTenantId(): string {
  // Try URL parameter first, then subdomain
  const urlTenant = getTenantIdFromUrl();
  const subdomainTenant = getTenantIdFromSubdomain();
  
  // Use URL parameter if valid
  if (urlTenant) {
    return urlTenant;
  }
  
  // Use subdomain only if it's not localhost-related
  if (subdomainTenant && !subdomainTenant.includes('localhost') && subdomainTenant !== '127') {
    return subdomainTenant;
  }
  
  // Default to ERP360 tenant
  return 'erp360';
}

export function applyTenantColors(primaryColor: string, secondaryColor: string) {
  const root = document.documentElement;
  
  // Convert hex to HSL if needed
  const primary = hexToHsl(primaryColor);
  const secondary = hexToHsl(secondaryColor);
  
  if (primary) {
    root.style.setProperty('--tenant-primary', primary);
    root.style.setProperty('--primary', primary);
  }
  
  if (secondary) {
    root.style.setProperty('--tenant-secondary', secondary);
    root.style.setProperty('--secondary', secondary);
  }
}

export function hexToHsl(hex: string): string | null {
  try {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `hsl(${h}, ${s}%, ${l}%)`;
  } catch (error) {
    console.error('Error converting hex to HSL:', error);
    return null;
  }
}

export function generateTenantAssetUrl(tenantId: string, assetType: string): string {
  return `/assets/${tenantId}/${assetType}`;
}

export function loadTenantConfig(config: TenantConfig) {
  // Store config globally for components to access
  (window as any).__tenantConfig = config;
  
  // Apply any global styles based on config
  if (config.primaryColor) {
    applyTenantColors(config.primaryColor, config.secondaryColor || '#424242');
  }
}

export function getTenantConfig(): TenantConfig {
  return (window as any).__tenantConfig || {
    welcomeMessage: 'Welcome to our platform',
    ssoProviders: [],
    mfaRequired: false,
  };
}

export function isSSOEnabled(provider: string): boolean {
  const config = getTenantConfig();
  return config.ssoProviders?.includes(provider) || false;
}

export function isMFARequired(): boolean {
  const config = getTenantConfig();
  return config.mfaRequired || false;
}
