import type { IAuthRepository, AuthSession } from '@core/ports/IAuthRepository';
import type { ITokenStorage } from '@core/ports/ITokenStorage';

interface RegisterParams {
  orgName: string;
  subdomain: string;
  fullName: string;
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly tokenStorage: ITokenStorage,
  ) {}

  async execute(params: RegisterParams): Promise<AuthSession> {
    const session = await this.authRepo.register(params);
    this.tokenStorage.setAccessToken(session.accessToken);
    this.tokenStorage.setRefreshToken(session.refreshToken);
    return session;
  }
}
