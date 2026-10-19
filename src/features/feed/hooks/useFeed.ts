import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "@/api/posts";
import { FEED_QUERY_KEY } from "../utils/feedCache";

export function useFeed() {
  return useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) => getPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });
}
