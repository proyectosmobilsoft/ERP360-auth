import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginRequest } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, ArrowRight } from 'lucide-react';
import { isSSOEnabled } from '@/lib/tenantUtils';
import { formatAuthError } from '@/lib/authUtils';

interface LoginFormProps {
  tenantId: string;
  onForgotPassword: () => void;
}

export function LoginForm({ tenantId, onForgotPassword }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const { config } = useTenant(tenantId);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      tenantId,
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    clearError();
    try {
      await login(data);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleSSOLogin = async (provider: string) => {
    // In a real implementation, this would redirect to the SSO provider
    console.log(`SSO login with ${provider}`);
    // Example: window.location.href = `/api/auth/sso/${provider}?tenant=${tenantId}`;
  };

  return (
    <div className="tenant-surface rounded-xl shadow-lg p-8 auth-slide-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-medium text-tenant-primary mb-2">Welcome back</h2>
        <p className="text-tenant-secondary">Sign in to your account to continue</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-tenant-primary">
                  Email address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="auth-input pl-10"
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-tenant-primary">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="auth-input pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-tenant-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-tenant-secondary">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="link"
              className="text-sm text-tenant-primary hover:text-tenant-primary p-0"
              onClick={onForgotPassword}
              disabled={isLoading}
            >
              Forgot password?
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 font-medium">{formatAuthError(error)}</span>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full tenant-primary hover:bg-tenant-primary-dark text-white auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="auth-spinner w-4 h-4 mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Sign In
                <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            )}
          </Button>
        </form>
      </Form>

      {/* SSO Options */}
      {(isSSOEnabled('google') || isSSOEnabled('microsoft')) && (
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-tenant-secondary">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {isSSOEnabled('google') && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSSOLogin('google')}
                disabled={isLoading}
                className="flex justify-center items-center"
              >
                <div className="w-4 h-4 mr-2 bg-red-500 rounded"></div>
                <span className="text-sm font-medium">Google</span>
              </Button>
            )}
            {isSSOEnabled('microsoft') && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSSOLogin('microsoft')}
                disabled={isLoading}
                className="flex justify-center items-center"
              >
                <div className="w-4 h-4 mr-2 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium">Microsoft</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
