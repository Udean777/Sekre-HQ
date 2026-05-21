import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMemberUseCase } from '@core/usecases/members/CreateMemberUseCase';
import { getMemberRepository } from '@di/container';
import type { Member } from '@core/domain/entities/Member';
import type { CreateMemberParams } from '@core/ports/IMemberRepository';
import { MEMBERS_QUERY_KEY } from './useMembersQuery';

export const useCreateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, CreateMemberParams>({
    mutationFn: params => {
      const useCase = new CreateMemberUseCase(getMemberRepository());
      return useCase.execute(params);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};
