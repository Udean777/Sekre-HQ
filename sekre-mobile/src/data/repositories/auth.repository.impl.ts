import { AuthRepository, AuthResult } from '@/domain/repositories/auth.repository';
import { UserEntity } from '@/domain/entities/user.entity';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.dto';
import { apiClient } from '@/core/network/api-client';
import { ENDPOINTS } from '@/core/config/api';
import { SecureStorage } from '@/core/storage/secure-storage';

class AuthRepositoryImpl implements AuthRepository {
  async login(req: LoginRequest): Promise<AuthResult> {
    const { data } = await apiClient.post<{ data: AuthResponse }>(ENDPOINTS.AUTH.LOGIN, req);
    
    // Save tokens securely
    const { tokens, user, organization, role } = data.data;
    await SecureStorage.save('access_token', tokens.access_token);
    await SecureStorage.save('refresh_token', tokens.refresh_token);

    return { user, organization, role };
  }

  async register(req: RegisterRequest): Promise<AuthResult> {
    const { data } = await apiClient.post<{ data: AuthResponse }>(ENDPOINTS.AUTH.REGISTER, req);
    
    // Save tokens securely
    const { tokens, user, organization, role } = data.data;
    await SecureStorage.save('access_token', tokens.access_token);
    await SecureStorage.save('refresh_token', tokens.refresh_token);

    return { user, organization, role };
  }

  async logout(): Promise<void> {
    // Optionally call backend to invalidate token
    // await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    await SecureStorage.remove('access_token');
    await SecureStorage.remove('refresh_token');
  }

  async getProfile(): Promise<AuthResult> {
    const { data } = await apiClient.get<{ data: AuthResult }>(ENDPOINTS.AUTH.ME);
    return data.data;
  }
}

export const authRepository = new AuthRepositoryImpl();
