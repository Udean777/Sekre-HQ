import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteMemberUseCase } from '@core/usecases/members/DeleteMemberUseCase';
import { getMemberRepository } from '@di/container';
import type { MemberId } from '@core/domain/entities/Member';
import { MEMBERS_QUERY_KEY } from './useMembersQuery';

export const useDeleteMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MemberId>({
    mutationFn: id => {
      const useCase = new DeleteMemberUseCase(getMemberRepository());
      return useCase.execute(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};
