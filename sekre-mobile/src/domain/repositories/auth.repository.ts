import { UserEntity } from '../entities/user.entity';
import { OrganizationEntity } from '../entities/organization.entity';
import { LoginRequest, RegisterRequest } from '@/data/models/auth.dto';

export interface AuthResult {
  user: UserEntity;
  organization: OrganizationEntity;
  role: string;
}

export interface AuthRepository {
  login(req: LoginRequest): Promise<AuthResult>;
  register(req: RegisterRequest): Promise<AuthResult>;
  logout(): Promise<void>;
  getProfile(): Promise<AuthResult>;
}
