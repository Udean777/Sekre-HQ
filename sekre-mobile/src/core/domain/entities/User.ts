import type { UserId } from '@core/domain/ids';

export type { UserId };

export interface User {
  id: UserId;
  email: string;
  fullName: string;
  mustResetPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}
