import { httpClient } from '@data/http/client';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';

/**
 * DI Container — wires semua dependencies
 *
 * Pola: factory functions (lazy instantiation)
 * Gunakan getter ini di hooks, bukan import langsung dari impl
 */

// Storage
export const getTokenStorage = (): typeof tokenStorage => tokenStorage;

// HTTP Client
export const getHttpClient = (): typeof httpClient => httpClient;

/**
 * Repositories akan di-register di sini saat Fase 2+
 *
 * Contoh:
 * import { AuthRepositoryImpl } from '@data/repositories/AuthRepositoryImpl';
 * let _authRepo: AuthRepositoryImpl | null = null;
 * export const getAuthRepository = (): AuthRepositoryImpl => {
 *   if (!_authRepo) _authRepo = new AuthRepositoryImpl(getHttpClient());
 *   return _authRepo;
 * };
 */
