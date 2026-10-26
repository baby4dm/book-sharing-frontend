import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getUserListings, getUserProfile } from "@/api/user";
import { useAuth } from "@/context/AuthContext";

export function useUserProfile(userId: string | undefined) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId && isAuthenticated,
  });
}

const LISTINGS_PAGE_SIZE = 8;

export function useUserListings(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["userListings", userId],
    queryFn: ({ pageParam }) =>
      getUserListings(userId!, pageParam, LISTINGS_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: !!userId,
  });
}
