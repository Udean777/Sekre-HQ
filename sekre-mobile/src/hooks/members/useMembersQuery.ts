import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetMembersUseCase } from '@core/usecases/members/GetMembersUseCase';
import { getMemberRepository } from '@di/container';
import type { MemberFilter, MemberListResult } from '@core/domain/entities/Member';

export const MEMBERS_QUERY_KEY = 'members';

export const useMembersQuery = (
  filter?: MemberFilter,
): UseQueryResult<MemberListResult, Error> => {
  return useQuery<MemberListResult, Error>({
    queryKey: [MEMBERS_QUERY_KEY, filter],
    queryFn: () => {
      const useCase = new GetMembersUseCase(getMemberRepository());
      return useCase.execute(filter);
    },
  });
};
