import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateMemberUseCase } from '@core/usecases/members/UpdateMemberUseCase';
import { getMemberRepository } from '@di/container';
import type { Member, MemberId } from '@core/domain/entities/Member';
import type { UpdateMemberParams } from '@core/ports/IMemberRepository';
import { MEMBERS_QUERY_KEY } from './useMembersQuery';

export const useUpdateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, { id: MemberId; params: UpdateMemberParams }>({
    mutationFn: ({ id, params }) => {
      const useCase = new UpdateMemberUseCase(getMemberRepository());
      return useCase.execute(id, params);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};
