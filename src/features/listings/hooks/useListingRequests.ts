import { getListingRequests } from "@/api/requests";
import { useQuery } from "@tanstack/react-query";

export const listingRequestsKey = (listingId: string) =>
  ["listingRequests", listingId] as const;

export function useListingRequests(listingId: string | undefined) {
  return useQuery({
    queryKey: listingRequestsKey(listingId ?? ""),
    queryFn: () => getListingRequests(listingId!),
    enabled: !!listingId,
  });
}
