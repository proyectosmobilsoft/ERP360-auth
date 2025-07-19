import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { MFAVerifyRequest } from '@shared/schema';

export const useMFA = () => {
  const [mfaCode, setMfaCode] = useState<string[]>(new Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { verifyMFA, user, requiresMFA } = useAuth();

  const updateMFACode = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digits
    
    const newCode = [...mfaCode];
    newCode[index] = value;
    setMfaCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input[data-mfa-index="${index + 1}"]`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }, [mfaCode]);

  const handleMFASubmit = useCallback(async () => {
    const code = mfaCode.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!user?.id) {
      setError('User information not found');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const mfaData: MFAVerifyRequest = {
        code,
        userId: user.id,
      };
      
      await verifyMFA(mfaData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'MFA verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [mfaCode, user?.id, verifyMFA]);

  const clearMFACode = useCallback(() => {
    setMfaCode(new Array(6).fill(''));
    setError(null);
  }, []);

  const resendMFACode = useCallback(async () => {
    // In a real implementation, this would trigger a new MFA code to be sent
    console.log('Resending MFA code...');
    clearMFACode();
  }, [clearMFACode]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      const prevInput = document.querySelector(
        `input[data-mfa-index="${index - 1}"]`
      ) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'Enter') {
      handleMFASubmit();
    }
  }, [mfaCode, handleMFASubmit]);

  const isCodeComplete = mfaCode.every(digit => digit !== '');

  return {
    mfaCode,
    isVerifying,
    error,
    requiresMFA,
    updateMFACode,
    handleMFASubmit,
    clearMFACode,
    resendMFACode,
    handleKeyDown,
    isCodeComplete,
  };
};
