import { getCurrentUserListings } from "@/api/listings";
import type { ListingFilters } from "../types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useCurrentUserListings(filters: ListingFilters) {
  return useInfiniteQuery({
    queryKey: ["myListings", filters],
    queryFn: ({ pageParam }) => getCurrentUserListings(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
  });
}
