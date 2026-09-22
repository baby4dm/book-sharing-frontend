import { rejectRequest } from "@/api/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      rejectRequest(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivedRequests"] });
    },
  });
}
