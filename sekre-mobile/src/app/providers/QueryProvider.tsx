import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { DehydratedState } from '@tanstack/react-query';
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
const CACHE_BUSTER = '1.0-2'; // bumped: infinite query schema change

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
      staleTime: 60_000,

      // gcTime: 24 jam — harus >= maxAge persister
      gcTime: MAX_CACHE_AGE_MS,

      // refetchOnReconnect: refetch saat koneksi pulih
      refetchOnReconnect: 'always',

      // refetchOnWindowFocus: refetch saat app kembali ke foreground
      refetchOnWindowFocus: true,

      // networkMode: 'online' — query tidak jalan saat offline
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

/**
 * isInfiniteData — type guard untuk InfiniteData shape.
 * InfiniteData selalu punya `pages` (array) dan `pageParams` (array).
 */
const isInfiniteData = (data: unknown): data is { pages: unknown[]; pageParams: unknown[] } => {
  if (typeof data !== 'object' || data === null) return false;
  return (
    'pages' in data && Array.isArray(data.pages) &&
    'pageParams' in data && Array.isArray(data.pageParams)
  );
};

/**
 * shouldDehydrateQuery — filter query yang akan di-persist ke MMKV.
 *
 * Rules:
 * 1. Hanya persist query yang sukses
 * 2. Skip query yang di-mark meta.persist=false
 * 3. Untuk infinite query: trim ke halaman pertama saja supaya cache
 *    tidak membengkak. User akan lihat page 1 dari cache, lalu refetch
 *    dari halaman 1 saat online.
 */
const shouldDehydrateQuery = (query: {
  state: { status: string };
  meta?: Record<string, unknown>;
}): boolean => {
  if (query.state.status !== 'success') return false;
  if (query.meta?.persist === false) return false;
  return true;
};

/**
 * serializeData — trim InfiniteData ke page pertama sebelum di-persist.
 * Non-infinite data di-pass through tanpa modifikasi.
 */
const serializeData = (data: DehydratedState): DehydratedState => {
  return {
    ...data,
    queries: data.queries.map(q => {
      if (!isInfiniteData(q.state.data)) return q;
      return {
        ...q,
        state: {
          ...q.state,
          data: {
            pages: q.state.data.pages.slice(0, 1),
            pageParams: q.state.data.pageParams.slice(0, 1),
          },
        },
      };
    }),
  };
};

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
        dehydrateOptions: {
          shouldDehydrateQuery,
          serializeData,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
