import type { AxiosInstance } from 'axios';
import type { IAuthRepository, AuthSession } from '@core/ports/IAuthRepository';
import { ENDPOINTS } from '@data/http/endpoints';
import type {
  AuthSessionDTO,
  GetMeResponseDTO,
  LoginRequestDTO,
  RefreshResponseDTO,
  RegisterRequestDTO,
} from '@data/dto/auth.dto';
import { mapAuthSessionDTOToEntity, mapGetMeResponseDTO } from '@data/mappers/auth.mapper';

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
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async logout(): Promise<void> {
    await this.http.post(ENDPOINTS.AUTH.LOGOUT);
  }
}
