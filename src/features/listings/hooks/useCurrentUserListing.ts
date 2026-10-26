import { getCurrentUserListings } from "@/api/listings";
import type { ListingFilters } from "../types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export function useCurrentUserListings(filters: ListingFilters) {
  // /api/listings/my лише для залогінених: у гостя 401 перекинув би з каталогу на /login
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    enabled: isAuthenticated,
    queryKey: ["myListings", filters],
    queryFn: ({ pageParam }) => getCurrentUserListings(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
  });
}
