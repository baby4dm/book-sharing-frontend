import { getListings } from "@/api/listings";
import type { ListingFilters } from "../types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useListings(filters: ListingFilters) {
  return useInfiniteQuery({
    queryKey: ["listings", filters],
    queryFn: ({ pageParam }) => getListings(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
  });
}
