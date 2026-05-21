import { httpClient } from '@data/http/client';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';
import { AuthRepositoryImpl } from '@data/repositories/AuthRepositoryImpl';
import type { IAuthRepository } from '@core/ports/IAuthRepository';

// Storage
export const getTokenStorage = (): typeof tokenStorage => tokenStorage;

// HTTP Client
export const getHttpClient = (): typeof httpClient => httpClient;

// Auth Repository — singleton
let _authRepo: IAuthRepository | null = null;
export const getAuthRepository = (): IAuthRepository => {
  if (!_authRepo) {
    _authRepo = new AuthRepositoryImpl(getHttpClient());
  }
  return _authRepo;
};
