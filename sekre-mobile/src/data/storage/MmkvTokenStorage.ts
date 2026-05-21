import { MMKV } from 'react-native-mmkv';
import type { ITokenStorage } from '@core/ports/ITokenStorage';

const ACCESS_TOKEN_KEY = 'auth.access_token';
const REFRESH_TOKEN_KEY = 'auth.refresh_token';

// Encrypted MMKV instance khusus token
const storage = new MMKV({
  id: 'sekre-token-storage',
  encryptionKey: 'sekre-mmkv-key', // TODO: ganti dengan key dari Keychain di production
});

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
