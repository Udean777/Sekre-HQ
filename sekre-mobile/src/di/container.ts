import { httpClient } from '@data/http/client';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';
import { AuthRepositoryImpl } from '@data/repositories/AuthRepositoryImpl';
import { TaskRepositoryImpl } from '@data/repositories/TaskRepositoryImpl';
import { MemberRepositoryImpl } from '@data/repositories/MemberRepositoryImpl';
import { DivisionRepositoryImpl } from '@data/repositories/DivisionRepositoryImpl';
import { EventRepositoryImpl } from '@data/repositories/EventRepositoryImpl';
import { FinanceRepositoryImpl } from '@data/repositories/FinanceRepositoryImpl';
import type { IAuthRepository } from '@core/ports/IAuthRepository';
import type { ITaskRepository } from '@core/ports/ITaskRepository';
import type { IMemberRepository } from '@core/ports/IMemberRepository';
import type { IDivisionRepository } from '@core/ports/IDivisionRepository';
import type { IEventRepository } from '@core/ports/IEventRepository';
import type { IFinanceRepository } from '@core/ports/IFinanceRepository';
import type { ITelemetry } from '@shared/observability';
import { SentryTelemetry, NoopTelemetry } from '@shared/observability';
import Config from 'react-native-config';

// Storage
export const getTokenStorage = (): typeof tokenStorage => tokenStorage;

// Telemetry — singleton
// Pakai SentryTelemetry kalau DSN tersedia, NoopTelemetry sebagai fallback
let _telemetry: ITelemetry | null = null;
export const getTelemetry = (): ITelemetry => {
  if (!_telemetry) {
    _telemetry = Config.SENTRY_DSN ? new SentryTelemetry() : new NoopTelemetry();
  }
  return _telemetry;
};

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

// Division Repository — singleton
let _divisionRepo: IDivisionRepository | null = null;
export const getDivisionRepository = (): IDivisionRepository => {
  if (!_divisionRepo) {
    _divisionRepo = new DivisionRepositoryImpl(getHttpClient());
  }
  return _divisionRepo;
};

// Event Repository — singleton
let _eventRepo: IEventRepository | null = null;
export const getEventRepository = (): IEventRepository => {
  if (!_eventRepo) {
    _eventRepo = new EventRepositoryImpl(getHttpClient());
  }
  return _eventRepo;
};

// Finance Repository — singleton
let _financeRepo: IFinanceRepository | null = null;
export const getFinanceRepository = (): IFinanceRepository => {
  if (!_financeRepo) {
    _financeRepo = new FinanceRepositoryImpl(getHttpClient());
  }
  return _financeRepo;
};
