import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginRequest } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';
import { formatAuthError } from '@/lib/authUtils';

interface SimpleLoginProps {
  tenantId: string;
  onSuccess?: () => void;
}

export function SimpleLogin({ tenantId, onSuccess }: SimpleLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

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
      onSuccess?.();
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
          <LogIn className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Acceso al Sistema</h2>
        <p className="text-sm text-gray-600 mt-1">Ingresa tus credenciales para continuar</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Usuario / Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="email"
                      placeholder="tu.email@empresa.com"
                      className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                <FormLabel className="text-sm font-medium text-gray-700">
                  Contraseña
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ingresa tu contraseña"
                      className="pl-10 pr-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-600">{formatAuthError(error)}</div>
            </div>
          )}

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verificando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </div>
            )}
          </Button>
        </form>
      </Form>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          ¿Problemas para acceder?{' '}
          <button className="text-blue-600 hover:underline">
            Contacta soporte
          </button>
        </p>
      </div>
    </div>
  );
}