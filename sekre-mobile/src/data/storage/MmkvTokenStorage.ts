import { MMKV } from 'react-native-mmkv';
import type { ITokenStorage } from '@core/ports/ITokenStorage';
import { KeychainService } from './KeychainService';

const ACCESS_TOKEN_KEY = 'auth.access_token';
const REFRESH_TOKEN_KEY = 'auth.refresh_token';
const FALLBACK_KEY = 'sekre-mmkv-fallback-key';

// MMKV instance — diinisialisasi dengan key dari Keychain
// Saat module pertama kali di-load, gunakan fallback key dulu
// lalu di-reinit setelah Keychain key tersedia via initStorage()
let storage = new MMKV({
  id: 'sekre-token-storage',
  encryptionKey: FALLBACK_KEY,
});

/**
 * Inisialisasi MMKV storage dengan encryption key dari Keychain.
 * Dipanggil sekali saat app startup (di App.tsx atau ReduxProvider).
 */
export const initTokenStorage = async (): Promise<void> => {
  try {
    const key = await KeychainService.getOrCreateEncryptionKey();
    storage = new MMKV({
      id: 'sekre-token-storage',
      encryptionKey: key,
    });
  } catch (error) {
    console.warn('[MmkvTokenStorage] Gagal init dengan Keychain key, pakai fallback:', error);
  }
};

export class MmkvTokenStorage implements ITokenStorage {
  getAccessToken(): string | null {
    return storage.getString(ACCESS_TOKEN_KEY) ?? null;
  }

  setAccessToken(token: string): void {
    storage.set(ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return storage.getString(REFRESH_TOKEN_KEY) ?? null;
  }

  setRefreshToken(token: string): void {
    storage.set(REFRESH_TOKEN_KEY, token);
  }

  clear(): void {
    storage.delete(ACCESS_TOKEN_KEY);
    storage.delete(REFRESH_TOKEN_KEY);
  }
}

// Singleton instance — dipakai di interceptors dan DI container
export const tokenStorage = new MmkvTokenStorage();
