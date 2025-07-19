import { useMFA } from '@/hooks/useMFA';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, RefreshCw, Shield } from 'lucide-react';
import { formatAuthError } from '@/lib/authUtils';

interface MFAVerifyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MFAVerify({ isOpen, onClose }: MFAVerifyProps) {
  const {
    mfaCode,
    isVerifying,
    error,
    updateMFACode,
    handleMFASubmit,
    clearMFACode,
    resendMFACode,
    handleKeyDown,
    isCodeComplete,
  } = useMFA();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 auth-fade-in">
      <div className="tenant-surface rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="text-green-600 w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-tenant-primary mb-2">
            Verificación de Seguridad
          </h3>
          <p className="text-tenant-secondary">
            Ingresa el código de 6 dígitos de tu aplicación autenticadora
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleMFASubmit(); }} className="space-y-6">
          {/* OTP Input */}
          <div>
            <div className="flex justify-center space-x-2">
              {mfaCode.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => updateMFACode(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-medium border-2 focus:ring-tenant-primary focus:border-tenant-primary"
                  disabled={isVerifying}
                  data-mfa-index={index}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 font-medium">{formatAuthError(error)}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                clearMFACode();
                onClose();
              }}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 tenant-primary hover:bg-tenant-primary-dark text-white"
              disabled={!isCodeComplete || isVerifying}
            >
              {isVerifying ? (
                <div className="flex items-center">
                  <div className="auth-spinner w-4 h-4 mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify'
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-tenant-primary hover:text-tenant-primary p-0 flex items-center"
              onClick={resendMFACode}
              disabled={isVerifying}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Didn't receive a code? Send again
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
