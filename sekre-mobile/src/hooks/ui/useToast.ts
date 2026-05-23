import { useCallback } from 'react';
import { useAppDispatch } from '@store/hooks';
import { showToast, dismissToast, clearToasts } from '@store/slices/uiSlice';
import type { ToastType } from '@store/slices/uiSlice';

interface UseToastReturn {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToast = (): UseToastReturn => {
  const dispatch = useAppDispatch();

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      dispatch(showToast({ message, type, duration }));
    },
    [dispatch],
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      dispatch(showToast({ message, type: 'success', duration }));
    },
    [dispatch],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      dispatch(showToast({ message, type: 'error', duration }));
    },
    [dispatch],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      dispatch(showToast({ message, type: 'warning', duration }));
    },
    [dispatch],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      dispatch(showToast({ message, type: 'info', duration }));
    },
    [dispatch],
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch(dismissToast(id));
    },
    [dispatch],
  );

  const clear = useCallback(() => {
    dispatch(clearToasts());
  }, [dispatch]);

  return { toast, success, error, warning, info, dismiss, clear };
};
