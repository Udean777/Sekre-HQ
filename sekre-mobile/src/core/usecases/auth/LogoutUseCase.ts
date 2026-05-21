import type { IAuthRepository } from '@core/ports/IAuthRepository';
import type { ITokenStorage } from '@core/ports/ITokenStorage';

export class LogoutUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly tokenStorage: ITokenStorage,
  ) {}

  async execute(): Promise<void> {
    try {
      // Best-effort — jika gagal (token expired), tetap clear local storage
      await this.authRepo.logout();
    } finally {
      this.tokenStorage.clear();
    }
  }
}
