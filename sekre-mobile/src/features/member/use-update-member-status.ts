import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { MemberStatus } from "@/features/member/use-members";

interface UpdateMemberStatusPayload {
  userId: string;
  status: MemberStatus;
}

const updateMemberStatus = async ({
  userId,
  status,
}: UpdateMemberStatusPayload) => {
  const { data } = await apiClient.patch(`/members/${userId}/status`, {
    status,
  });
  return data;
};

export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
};
