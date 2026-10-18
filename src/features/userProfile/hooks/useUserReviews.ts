import { getUserReviews } from "@/api/user";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 5;

export function useUserReviews(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["userReviews", userId],
    queryFn: ({ pageParam }) => getUserReviews(userId!, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: !!userId,
  });
}
