import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ListingRequestRequest } from "../types";
import { createRequest } from "@/api/requests";

export function useCreateRequest(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ListingRequestRequest) =>
      createRequest(listingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
    },
  });
}
