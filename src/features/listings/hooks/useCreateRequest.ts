import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRequest } from "@/api/requests";
import { listingRequestsKey } from "./useListingRequests";
import type { ListingRequestRequest } from "@/features/requests/types";

export function useCreateRequest(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ListingRequestRequest) =>
      createRequest(listingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({
        queryKey: listingRequestsKey(listingId),
      });
    },
  });
}
