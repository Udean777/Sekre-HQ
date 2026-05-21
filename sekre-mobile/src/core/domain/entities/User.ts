// Branded types untuk type safety
export type UserId = string & { __brand: 'UserId' };

export interface User {
  id: UserId;
  email: string;
  fullName: string;
  mustResetPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}
