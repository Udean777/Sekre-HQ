import { AppState, type AppStateStatus } from 'react-native';
import { focusManager } from '@tanstack/react-query';

/**
 * setupFocusManager — wire AppState → React Query focusManager.
 *
 * Tanpa ini, React Query tidak refetch saat app kembali ke foreground
 * (background → active). Dengan ini, data stale otomatis di-refresh
 * saat user kembali ke app setelah beberapa waktu.
 *
 * Panggil sekali di app entry point (index.js) sebelum AppRegistry.
 *
 * Returns unsubscribe function untuk cleanup (opsional).
 */
export const setupFocusManager = (): (() => void) => {
  const handleAppStateChange = (status: AppStateStatus): void => {
    focusManager.setFocused(status === 'active');
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return (): void => subscription.remove();
};
