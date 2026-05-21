import type { AxiosInstance } from 'axios';
import type { IAuthRepository, AuthSession } from '@core/ports/IAuthRepository';
import type { User } from '@core/domain/entities/User';
import type { Organization } from '@core/domain/entities/Organization';
import { ENDPOINTS } from '@data/http/endpoints';
import type {
  AuthSessionDTO,
  GetMeResponseDTO,
  LoginRequestDTO,
  RefreshResponseDTO,
  RegisterRequestDTO,
  UpdateProfileRequestDTO,
  ChangePasswordRequestDTO,
  UpdateOrganizationRequestDTO,
} from '@data/dto/auth.dto';
import {
  mapAuthSessionDTOToEntity,
  mapGetMeResponseDTO,
  mapUserDTOToEntity,
  mapOrganizationDTOToEntity,
} from '@data/mappers/auth.mapper';
import type { UserDTO, OrganizationDTO } from '@data/dto/auth.dto';

export class AuthRepositoryImpl implements IAuthRepository {
  constructor(private readonly http: AxiosInstance) {}

  async login(email: string, password: string): Promise<AuthSession> {
    const payload: LoginRequestDTO = { email, password };
    const { data } = await this.http.post<AuthSessionDTO>(ENDPOINTS.AUTH.LOGIN, payload);
    return mapAuthSessionDTOToEntity(data);
  }

  async register(params: {
    orgName: string;
    subdomain: string;
    fullName: string;
    email: string;
    password: string;
  }): Promise<AuthSession> {
    const payload: RegisterRequestDTO = {
      org_name: params.orgName,
      subdomain: params.subdomain,
      full_name: params.fullName,
      email: params.email,
      password: params.password,
    };
    const { data } = await this.http.post<AuthSessionDTO>(ENDPOINTS.AUTH.REGISTER, payload);
    return mapAuthSessionDTOToEntity(data);
  }

  async getMe(): Promise<Pick<AuthSession, 'user' | 'organization' | 'role'>> {
    const { data } = await this.http.get<GetMeResponseDTO>(ENDPOINTS.AUTH.ME);
    return mapGetMeResponseDTO(data);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data } = await this.http.post<RefreshResponseDTO>(ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });
    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
    };
  }

  async logout(): Promise<void> {
    await this.http.post(ENDPOINTS.AUTH.LOGOUT);
  }

  async updateProfile(params: { fullName: string; email: string }): Promise<User> {
    const payload: UpdateProfileRequestDTO = {
      full_name: params.fullName,
      email: params.email,
    };
    const { data } = await this.http.patch<UserDTO>(ENDPOINTS.USERS.UPDATE_PROFILE, payload);
    return mapUserDTOToEntity(data);
  }

  async changePassword(params: { currentPassword: string; newPassword: string }): Promise<void> {
    const payload: ChangePasswordRequestDTO = {
      current_password: params.currentPassword,
      new_password: params.newPassword,
    };
    await this.http.post(ENDPOINTS.USERS.CHANGE_PASSWORD, payload);
  }

  async updateOrganization(params: { name: string }): Promise<Organization> {
    const payload: UpdateOrganizationRequestDTO = { name: params.name };
    const { data } = await this.http.patch<OrganizationDTO>(
      ENDPOINTS.ORGANIZATIONS.UPDATE,
      payload,
    );
    return mapOrganizationDTOToEntity(data);
  }
}
