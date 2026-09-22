import { cancelRequest } from "@/api/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCancelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
    },
  });
}
