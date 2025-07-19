import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordRequest } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, ArrowRight, CheckCircle, Send, Key } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatAuthError } from '@/lib/authUtils';

interface ForgotPasswordFormProps {
  tenantId: string;
}

export function ForgotPasswordForm({ tenantId }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      tenantId,
    },
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiRequest('POST', '/api/auth/forgot-password', data);
      setIsSuccess(true);
    } catch (error) {
      setError(formatAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="tenant-surface rounded-xl shadow-lg p-8 auth-fade-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-green-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-medium text-tenant-primary mb-2">Check your email</h2>
          <p className="text-tenant-secondary mb-6">
            If an account with that email exists, we've sent you a link to reset your password.
          </p>
          <p className="text-sm text-tenant-secondary">
            Didn't receive an email? Check your spam folder or try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-surface rounded-xl shadow-lg p-8 auth-slide-in">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Key className="text-blue-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-medium text-tenant-primary mb-2">Recuperar Contraseña</h2>
        <p className="text-tenant-secondary">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full tenant-primary hover:bg-tenant-primary-dark text-white auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="auth-spinner w-4 h-4 mr-2"></div>
                Sending reset link...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Send className="mr-2 w-4 h-4" />
                <span>Enviar Enlace</span>
              </div>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-tenant-secondary">
          Remember your password?{' '}
          <button className="text-tenant-primary hover:underline font-medium">
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
