import type { IAuthRepository } from '@core/ports/IAuthRepository';

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(params: ChangePasswordParams): Promise<void> {
    return this.authRepository.changePassword(params);
  }
}
