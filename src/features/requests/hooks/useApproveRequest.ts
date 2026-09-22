import { approveReqest } from "@/api/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveReqest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivedRequests"] });
    },
  });
}
