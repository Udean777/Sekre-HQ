import type { IAuthRepository, AuthSession } from '@core/ports/IAuthRepository';

export class GetMeUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<Pick<AuthSession, 'user' | 'organization' | 'role'>> {
    return this.authRepo.getMe();
  }
}
