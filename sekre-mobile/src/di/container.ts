import { httpClient } from '@data/http/client';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';
import { AuthRepositoryImpl } from '@data/repositories/AuthRepositoryImpl';
import { TaskRepositoryImpl } from '@data/repositories/TaskRepositoryImpl';
import { MemberRepositoryImpl } from '@data/repositories/MemberRepositoryImpl';
import type { IAuthRepository } from '@core/ports/IAuthRepository';
import type { ITaskRepository } from '@core/ports/ITaskRepository';
import type { IMemberRepository } from '@core/ports/IMemberRepository';

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

// Task Repository — singleton
let _taskRepo: ITaskRepository | null = null;
export const getTaskRepository = (): ITaskRepository => {
  if (!_taskRepo) {
    _taskRepo = new TaskRepositoryImpl(getHttpClient());
  }
  return _taskRepo;
};

// Member Repository — singleton
let _memberRepo: IMemberRepository | null = null;
export const getMemberRepository = (): IMemberRepository => {
  if (!_memberRepo) {
    _memberRepo = new MemberRepositoryImpl(getHttpClient());
  }
  return _memberRepo;
};
