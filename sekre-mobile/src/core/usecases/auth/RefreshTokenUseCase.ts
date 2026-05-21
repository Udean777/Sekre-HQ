import type { IAuthRepository } from '@core/ports/IAuthRepository';
import type { ITokenStorage } from '@core/ports/ITokenStorage';

export class RefreshTokenUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly tokenStorage: ITokenStorage,
  ) {}

  async execute(): Promise<void> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const tokens = await this.authRepo.refresh(refreshToken);
    this.tokenStorage.setAccessToken(tokens.accessToken);
    this.tokenStorage.setRefreshToken(tokens.refreshToken);
  }
}
