import type { User } from '@core/domain/entities/User';
import type { Organization } from '@core/domain/entities/Organization';
import type { OrgRole } from '@store/slices/authSlice';

export interface AuthSession {
  user: User;
  organization: Organization;
  role: OrgRole;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  register(params: {
    orgName: string;
    subdomain: string;
    fullName: string;
    email: string;
    password: string;
  }): Promise<AuthSession>;
  getMe(): Promise<Pick<AuthSession, 'user' | 'organization' | 'role'>>;
  refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(): Promise<void>;
  updateProfile(params: { fullName: string; email: string }): Promise<User>;
  changePassword(params: { currentPassword: string; newPassword: string }): Promise<void>;
  updateOrganization(params: { name: string }): Promise<Organization>;
}
