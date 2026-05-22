import type { User, UserId } from '@core/domain/entities/User';
import type { Organization, OrgId } from '@core/domain/entities/Organization';
import type { AuthSession } from '@core/ports/IAuthRepository';
import type { OrgRole } from '@store/slices/authSlice';
import type {
  UserDTO,
  OrganizationDTO,
  AuthSessionDTO,
  GetMeResponseDTO,
} from '@data/dto/auth.dto';

export const mapUserDTOToEntity = (dto: UserDTO): User => ({
  id: dto.id as UserId,
  email: dto.email,
  fullName: dto.full_name,
  mustResetPassword: dto.must_reset_password,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapOrganizationDTOToEntity = (dto: OrganizationDTO): Organization => ({
  id: dto.id as OrgId,
  name: dto.name,
  subdomain: dto.subdomain,
  subscriptionPlan: dto.subscription_plan,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapAuthSessionDTOToEntity = (dto: AuthSessionDTO): AuthSession => ({
  accessToken: dto.data.tokens.access_token,
  refreshToken: dto.data.tokens.refresh_token,
  user: mapUserDTOToEntity(dto.data.user),
  organization: mapOrganizationDTOToEntity(dto.data.organization),
  role: dto.data.role as OrgRole,
});

export const mapGetMeResponseDTO = (
  dto: GetMeResponseDTO,
): Pick<AuthSession, 'user' | 'organization' | 'role'> => ({
  user: mapUserDTOToEntity(dto.data.user),
  organization: mapOrganizationDTOToEntity(dto.data.organization),
  role: dto.data.role as OrgRole,
});
