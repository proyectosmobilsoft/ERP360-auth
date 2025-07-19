import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { MFAVerify } from './MFAVerify';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthFormContainerProps {
  tenantId: string;
  app?: string;
  module?: string;
}

export function AuthFormContainer({ tenantId, app = 'CRM', module = 'Auth' }: AuthFormContainerProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const { requiresMFA } = useAuth();
  const { tenant } = useTenant(tenantId);

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm 
            tenantId={tenantId} 
            onForgotPassword={() => setMode('forgot')} 
          />
        );
      case 'register':
        return <RegisterForm tenantId={tenantId} />;
      case 'forgot':
        return <ForgotPasswordForm tenantId={tenantId} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        {tenant?.logo ? (
          <img 
            src={tenant.logo} 
            alt={tenant.name}
            className="h-12 mx-auto object-contain"
          />
        ) : (
          <div className="inline-block tenant-primary text-white px-6 py-3 rounded-lg font-medium">
            {tenant?.name || 'Platform'}
          </div>
        )}
      </div>

      {/* Form Navigation Tabs */}
      <div className="mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={mode === 'login' ? 'default' : 'ghost'}
            className={`flex-1 ${mode === 'login' ? 'tenant-surface text-tenant-primary shadow-sm' : 'text-tenant-secondary hover:text-tenant-primary'}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </Button>
          <Button
            variant={mode === 'register' ? 'default' : 'ghost'}
            className={`flex-1 ${mode === 'register' ? 'tenant-surface text-tenant-primary shadow-sm' : 'text-tenant-secondary hover:text-tenant-primary'}`}
            onClick={() => setMode('register')}
          >
            Sign Up
          </Button>
          <Button
            variant={mode === 'forgot' ? 'default' : 'ghost'}
            className={`flex-1 ${mode === 'forgot' ? 'tenant-surface text-tenant-primary shadow-sm' : 'text-tenant-secondary hover:text-tenant-primary'}`}
            onClick={() => setMode('forgot')}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Form Content */}
      {renderForm()}

      {/* MFA Modal */}
      <MFAVerify 
        isOpen={requiresMFA} 
        onClose={() => {}} 
      />

      {/* Footer Links */}
      <div className="mt-8 text-center text-sm text-tenant-secondary">
        <p>
          By continuing, you agree to our{' '}
          <a href="#" className="text-tenant-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-tenant-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Tenant Info Footer */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs text-tenant-secondary">
          <Building2 className="w-3 h-3 mr-1" />
          <span>Tenant: {tenant?.name || 'Unknown'}</span>
          <span className="mx-1">•</span>
          <span>App: {app}</span>
        </div>
      </div>
    </div>
  );
}
