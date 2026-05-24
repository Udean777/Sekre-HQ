import { MMKV } from 'react-native-mmkv';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { Persister } from '@tanstack/react-query-persist-client';

/**
 * MMKV instance khusus untuk React Query cache.
 * Dipisah dari redux storage ('sekre-redux-storage') supaya
 * clear cache RQ tidak mempengaruhi auth state Redux.
 */
const mmkv = new MMKV({ id: 'sekre-rq-cache' });

/**
 * MMKV-backed sync storage adapter untuk React Query persister.
 *
 * Pakai sync storage (bukan async) karena MMKV operasinya synchronous
 * dan createSyncStoragePersister lebih sederhana + tidak ada race condition.
 */
const mmkvStorage = {
  getItem: (key: string): string | null => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string): void => mmkv.set(key, value),
  removeItem: (key: string): void => mmkv.delete(key),
};

/**
 * createMmkvQueryPersister — factory untuk MMKV-backed React Query persister.
 *
 * Cache di-persist ke MMKV sehingga cold start langsung render dari cache
 * sambil revalidate di background (stale-while-revalidate).
 *
 * `buster` dipakai untuk auto-invalidate cache antar release — set ke
 * kombinasi appVersion + buildNumber supaya cache lama tidak dipakai
 * setelah schema berubah.
 */
export const createMmkvQueryPersister = (): Persister =>
  createSyncStoragePersister({
    storage: mmkvStorage,
    key: 'sekre-rq-cache',
  });
