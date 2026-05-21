import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from '@store/hooks';
import { updateOrganization } from '@store/slices/authSlice';
import { UpdateOrganizationUseCase } from '@core/usecases/auth/UpdateOrganizationUseCase';
import { getAuthRepository } from '@di/container';
import type { Organization } from '@core/domain/entities/Organization';
import type { UpdateOrganizationParams } from '@core/usecases/auth/UpdateOrganizationUseCase';

export const useUpdateOrganizationMutation = () => {
  const dispatch = useAppDispatch();

  return useMutation<Organization, Error, UpdateOrganizationParams>({
    mutationFn: params => {
      const useCase = new UpdateOrganizationUseCase(getAuthRepository());
      return useCase.execute(params);
    },
    onSuccess: org => {
      dispatch(
        updateOrganization({
          name: org.name,
          subdomain: org.subdomain,
          subscriptionPlan: org.subscriptionPlan,
        }),
      );
    },
  });
};
