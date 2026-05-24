import { useInfiniteQuery, type UseInfiniteQueryResult, type InfiniteData } from '@tanstack/react-query';
import { GetMembersUseCase } from '@core/usecases/members/GetMembersUseCase';
import { getMemberRepository } from '@di/container';
import type { MemberFilter, MemberPage } from '@core/domain/entities/Member';

export const MEMBERS_QUERY_KEY = 'members';

export const useMembersQuery = (
  filter?: Omit<MemberFilter, 'page'>,
): UseInfiniteQueryResult<InfiniteData<MemberPage>, Error> => {
  return useInfiniteQuery<MemberPage, Error, InfiniteData<MemberPage>, unknown[], number>({
    queryKey: [MEMBERS_QUERY_KEY, filter],
    queryFn: ({ pageParam }) => {
      const useCase = new GetMembersUseCase(getMemberRepository());
      return useCase.execute({ ...filter, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: last => last.meta.nextPage ?? undefined,
  });
};
