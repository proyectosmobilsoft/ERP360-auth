import { useTenant } from '@/hooks/useTenant';
import { Shield, Users, Smartphone } from 'lucide-react';

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
          {tenant?.logo ? (
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
        <h1 className="text-4xl font-light mb-6">
          {config.welcomeMessage || 'Secure Enterprise Authentication'}
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          Multi-tenant SSO solution with enterprise-grade security features and seamless integration across all your applications.
        </p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>Enterprise Security</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>Multi-Tenant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-6 h-6" />
            <span>MFA Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
