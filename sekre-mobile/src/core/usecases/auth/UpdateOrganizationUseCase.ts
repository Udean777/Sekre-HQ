import type { IAuthRepository } from '@core/ports/IAuthRepository';
import type { Organization } from '@core/domain/entities/Organization';

export interface UpdateOrganizationParams {
  name: string;
}

export class UpdateOrganizationUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(params: UpdateOrganizationParams): Promise<Organization> {
    return this.authRepository.updateOrganization(params);
  }
}
