/**
 * Hook-based DI — expose repository instances via hooks.
 *
 * Keuntungan vs direct container access:
 * - Testable: bisa di-mock di test tanpa mock seluruh container
 * - Explicit: dependency terlihat jelas di hook signature
 * - Consistent: semua hooks pakai pola yang sama
 *
 * Semua hooks ini adalah thin wrappers — tidak ada logic di sini.
 * Logic ada di use cases dan repository implementations.
 */

import {
  getTaskRepository,
  getMemberRepository,
  getDivisionRepository,
  getEventRepository,
  getFinanceRepository,
  getAuthRepository,
  getTelemetry,
} from '@di/container';
import type { ITaskRepository } from '@core/ports/ITaskRepository';
import type { IMemberRepository } from '@core/ports/IMemberRepository';
import type { IDivisionRepository } from '@core/ports/IDivisionRepository';
import type { IEventRepository } from '@core/ports/IEventRepository';
import type { IFinanceRepository } from '@core/ports/IFinanceRepository';
import type { IAuthRepository } from '@core/ports/IAuthRepository';
import type { ITelemetry } from '@shared/observability';

export const useTaskRepository = (): ITaskRepository => getTaskRepository();
export const useMemberRepository = (): IMemberRepository => getMemberRepository();
export const useDivisionRepository = (): IDivisionRepository => getDivisionRepository();
export const useEventRepository = (): IEventRepository => getEventRepository();
export const useFinanceRepository = (): IFinanceRepository => getFinanceRepository();
export const useAuthRepository = (): IAuthRepository => getAuthRepository();
export const useTelemetry = (): ITelemetry => getTelemetry();
