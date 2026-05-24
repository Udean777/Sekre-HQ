import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { MMKV } from 'react-native-mmkv';
import type { Storage, PersistedState } from 'redux-persist';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// ─── MMKV Storage adapter ─────────────────────────────────────────────────────

const mmkv = new MMKV({ id: 'sekre-redux-storage' });

const mmkvStorage: Storage = {
  setItem: (key, value) => {
    mmkv.set(key, value);
    return Promise.resolve(true);
  },
  getItem: key => {
    const value = mmkv.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: key => {
    mmkv.delete(key);
    return Promise.resolve();
  },
};

// ─── Auth persist migrations ──────────────────────────────────────────────────

/**
 * v1 schema (sebelum PR-4):
 * { isAuthenticated: boolean; user: AuthUser | null; organization: ...; role: ... }
 *
 * v2 schema (PR-4):
 * Discriminated union: { status: 'unauthenticated' } | { status: 'authenticated'; user; organization; role }
 *
 * Migration: jika v1 state punya `isAuthenticated: true` dan semua field ada,
 * convert ke v2 authenticated shape. Jika tidak, reset ke unauthenticated.
 */
type AuthStateV1 = {
  isAuthenticated?: boolean;
  user?: { id: string; email: string; fullName: string; mustResetPassword: boolean } | null;
  organization?: { id: string; name: string; subdomain: string; subscriptionPlan: string } | null;
  role?: string | null;
};

const isV1AuthState = (state: unknown): state is AuthStateV1 =>
  typeof state === 'object' && state !== null && 'isAuthenticated' in state;

const authMigrations = {
  2: (state: PersistedState): PersistedState => {
    const persist = state?._persist ?? { version: 2, rehydrated: true };

    if (!isV1AuthState(state)) {
      // redux-persist MigrationManifest requires PersistedState return type,
      // but our discriminated union cannot satisfy it without this boundary cast.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return { status: 'unauthenticated', _persist: persist } as unknown as PersistedState;
    }

    if (
      state.isAuthenticated === true &&
      state.user != null &&
      state.organization != null &&
      state.role != null
    ) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        status: 'authenticated',
        user: {
          id: state.user.id,
          email: state.user.email,
          fullName: state.user.fullName,
          mustResetPassword: state.user.mustResetPassword,
        },
        organization: {
          id: state.organization.id,
          name: state.organization.name,
          subdomain: state.organization.subdomain,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          subscriptionPlan: state.organization.subscriptionPlan as 'FREE' | 'LITE' | 'PRO',
        },
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        role: state.role as 'OWNER' | 'ADMIN' | 'MEMBER',
        _persist: persist,
      } as unknown as PersistedState;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return { status: 'unauthenticated', _persist: persist } as unknown as PersistedState;
  },
};

const authPersistConfig = {
  key: 'auth',
  version: 2,
  storage: mmkvStorage,
  migrate: createMigrate(authMigrations, { debug: false }),
  // Tidak perlu whitelist — seluruh discriminated union di-persist
};

// ─── Root reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  ui: uiReducer,
});

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
