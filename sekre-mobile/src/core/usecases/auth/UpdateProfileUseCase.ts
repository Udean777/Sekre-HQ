import type { IAuthRepository } from '@core/ports/IAuthRepository';
import type { User } from '@core/domain/entities/User';

export interface UpdateProfileParams {
  fullName: string;
  email: string;
}

export class UpdateProfileUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(params: UpdateProfileParams): Promise<User> {
    return this.authRepository.updateProfile(params);
  }
}
