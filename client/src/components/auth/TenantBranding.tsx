import { useTenant } from '@/hooks/useTenant';
import { Shield, Building2, KeyRound, Zap, Globe, Lock } from 'lucide-react';
import erp360Logo from '@/assets/erp360-logo.svg';

interface TenantBrandingProps {
  tenantId: string;
}

export function TenantBranding({ tenantId }: TenantBrandingProps) {
  const { tenant, config, isLoading } = useTenant(tenantId);

  if (isLoading) {
    return (
      <div className="hidden lg:flex lg:w-1/2 tenant-primary relative overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="auth-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex lg:w-1/2 tenant-primary relative overflow-hidden">
      {/* Tenant Logo Area */}
      <div className="absolute top-8 left-8 z-10">
        <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
          {tenant?.name === 'ERP360' ? (
            <img 
              src={erp360Logo} 
              alt="ERP360"
              className="w-48 h-12 object-contain filter brightness-0 invert"
            />
          ) : tenant?.logo ? (
            <img 
              src={tenant.logo} 
              alt={tenant.name}
              className="w-32 h-8 object-contain"
            />
          ) : (
            <div className="w-32 h-8 bg-white bg-opacity-40 rounded flex items-center justify-center text-white text-sm font-medium">
              {tenant?.name || 'Platform'}
            </div>
          )}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 auth-grid-pattern"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center p-12 text-white">
        <div className="flex items-center mb-4">
          <Zap className="w-10 h-10 mr-3" />
          <h1 className="text-4xl font-bold">
            {tenant?.name === 'ERP360' ? 'ERP360' : config.welcomeMessage || 'Secure Enterprise Authentication'}
          </h1>
        </div>
        <p className="text-xl text-blue-100 mb-8">
          {tenant?.name === 'ERP360' 
            ? 'Plataforma empresarial completa con autenticación segura, gestión multitenant y integración SSO de nivel empresarial.'
            : 'Multi-tenant SSO solution with enterprise-grade security features and seamless integration across all your applications.'
          }
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3">
            <Shield className="w-6 h-6" />
            <span className="text-sm font-medium">Seguridad Empresarial</span>
          </div>
          <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3">
            <Building2 className="w-6 h-6" />
            <span className="text-sm font-medium">Multi-Tenant</span>
          </div>
          <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3">
            <KeyRound className="w-6 h-6" />
            <span className="text-sm font-medium">Autenticación MFA</span>
          </div>
          <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3">
            <Globe className="w-6 h-6" />
            <span className="text-sm font-medium">SSO Integrado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
