import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthFormContainer } from '@/components/auth/AuthFormContainer';
import { TenantBranding } from '@/components/auth/TenantBranding';
import { extractTenantId } from '@/lib/tenantUtils';
import { useLocation } from 'wouter';

interface AuthPageProps {
  tenantId?: string;
  app?: string;
  module?: string;
}

export default function AuthPage({ 
  tenantId: propTenantId,
  app = 'CRM',
  module = 'Auth Microfrontend'
}: AuthPageProps) {
  const tenantId = propTenantId || extractTenantId();
  const { isAuthenticated, user } = useAuth();
  const { tenant, loadTenant } = useTenant(tenantId);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (tenantId) {
      loadTenant(tenantId);
    }
  }, [tenantId, loadTenant]);

  useEffect(() => {
    // Redirect authenticated users
    if (isAuthenticated && user) {
      // In a real microfrontend setup, this might communicate with the parent app
      console.log('User authenticated, redirecting...', user);
      // navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <AuthProvider tenantId={tenantId} app={app} module={module}>
      <div className="min-h-screen flex tenant-background">
        {/* Left Panel - Tenant Branding */}
        <TenantBranding tenantId={tenantId} />

        {/* Right Panel - Authentication Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <AuthFormContainer 
            tenantId={tenantId}
            app={app}
            module={module}
          />
        </div>
      </div>

      {/* Development Helper Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg p-4 text-xs max-w-xs">
          <h4 className="font-medium mb-2">Development Info</h4>
          <div className="space-y-1 text-gray-300">
            <div>State: Authentication Ready</div>
            <div>Tenant: {tenant?.name || 'Loading...'}</div>
            <div>Module: {module}</div>
            <div>Environment: Development</div>
          </div>
        </div>
      )}
    </AuthProvider>
  );
}
