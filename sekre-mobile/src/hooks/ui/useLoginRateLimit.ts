import { useState, useCallback, useRef } from 'react';

/**
 * useLoginRateLimit — client-side rate limit guard untuk login form.
 *
 * Setelah N kali gagal berturut-turut, disable tombol login selama
 * `lockoutSeconds` detik. Countdown ditampilkan di UI.
 *
 * Ini bukan pengganti server-side rate limiting — hanya UX guard
 * untuk mencegah accidental brute force dan memberikan feedback
 * yang jelas ke user.
 *
 * @param maxAttempts     — jumlah gagal sebelum lockout (default 5)
 * @param lockoutSeconds  — durasi lockout dalam detik (default 30)
 */
export interface LoginRateLimitState {
  isLocked: boolean;
  remainingSeconds: number;
  failureCount: number;
  recordFailure: () => void;
  recordSuccess: () => void;
}

export const useLoginRateLimit = (maxAttempts = 5, lockoutSeconds = 30): LoginRateLimitState => {
  const [failureCount, setFailureCount] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = (): void => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startLockout = useCallback((): void => {
    setIsLocked(true);
    setRemainingSeconds(lockoutSeconds);

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [lockoutSeconds]);

  const recordFailure = useCallback((): void => {
    setFailureCount(prev => {
      const next = prev + 1;
      if (next >= maxAttempts) {
        startLockout();
        return 0; // reset counter setelah lockout dimulai
      }
      return next;
    });
  }, [maxAttempts, startLockout]);

  const recordSuccess = useCallback((): void => {
    clearTimer();
    setFailureCount(0);
    setIsLocked(false);
    setRemainingSeconds(0);
  }, []);

  return {
    isLocked,
    remainingSeconds,
    failureCount,
    recordFailure,
    recordSuccess,
  };
};
