import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createMmkvQueryPersister } from '@data/cache/MmkvQueryPersister';
import { isDomainError, NetworkError } from '@core/domain/errors/DomainError';

/**
 * Cache buster — kombinasi versi app + build number.
 * Saat nilai ini berubah (rilis baru), seluruh persisted cache di-invalidate
 * otomatis supaya schema lama tidak dipakai setelah breaking change.
 *
 * Format: "versionName-versionCode"
 * Nilai ini harus diupdate manual saat ada perubahan schema entity.
 */
const CACHE_BUSTER = '1.0-1';

/**
 * maxAge — berapa lama cache boleh dipakai setelah app ditutup.
 * 24 jam: user yang buka app keesokan harinya masih dapat data dari cache
 * sambil revalidate di background.
 */
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24 jam

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry hanya untuk network error, bukan domain error (4xx)
      retry: (failureCount: number, error: unknown): boolean => {
        if (isDomainError(error) && !(error instanceof NetworkError)) {
          return false;
        }
        return failureCount < 2;
      },

      // staleTime: 1 menit — data dianggap fresh selama 1 menit.
      // Setelah itu, background refetch terjadi saat query di-mount atau
      // app kembali ke foreground (via focusManager).
      staleTime: 60_000,

      // gcTime: 24 jam — data di memory selama ini sebelum di-GC.
      // Harus >= maxAge persister supaya data yang di-restore dari MMKV
      // tidak langsung di-GC.
      gcTime: MAX_CACHE_AGE_MS,

      // refetchOnReconnect: refetch saat koneksi pulih (via onlineManager)
      refetchOnReconnect: 'always',

      // refetchOnWindowFocus: refetch saat app kembali ke foreground
      // (via focusManager yang sudah di-wire ke AppState di index.js)
      refetchOnWindowFocus: true,

      // networkMode: 'online' — query tidak jalan saat offline,
      // akan di-queue dan dijalankan saat koneksi pulih
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});

// Singleton persister — dibuat sekali di module scope
const persister = createMmkvQueryPersister();

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: MAX_CACHE_AGE_MS,
        buster: CACHE_BUSTER,
        // Jangan persist query yang error atau yang di-mark meta.persist=false
        dehydrateOptions: {
          shouldDehydrateQuery: query =>
            query.state.status === 'success' && query.meta?.persist !== false,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
