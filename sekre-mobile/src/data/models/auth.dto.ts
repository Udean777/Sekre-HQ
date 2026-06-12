import { UserEntity } from '@/domain/entities/user.entity';
import { OrganizationEntity } from '@/domain/entities/organization.entity';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password?: string;
  organization_name: string;
  subdomain: string;
}

// Tergantung response backend, biasanya return token dan user profile
export interface AuthResponse {
  tokens: {
    access_token: string;
    refresh_token: string;
  };
  user: UserEntity;
  organization: OrganizationEntity;
  role: string;
}
