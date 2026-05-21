import type { IAuthRepository, AuthSession } from '@core/ports/IAuthRepository';
import type { ITokenStorage } from '@core/ports/ITokenStorage';

export class LoginUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly tokenStorage: ITokenStorage,
  ) {}

  async execute(email: string, password: string): Promise<AuthSession> {
    const session = await this.authRepo.login(email, password);
    this.tokenStorage.setAccessToken(session.accessToken);
    this.tokenStorage.setRefreshToken(session.refreshToken);
    return session;
  }
}
