import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { Page } from "@/lib/types";
import type { PostResponse } from "../types";

export const FEED_QUERY_KEY = ["feed"] as const;

export const postCommentsKey = (postId: string) =>
  ["postComments", postId] as const;

type FeedData = InfiniteData<Page<PostResponse>>;

export function updatePostInFeed(
  queryClient: QueryClient,
  postId: string,
  update: (post: PostResponse) => PostResponse,
) {
  queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            content: page.content.map((post) =>
              post.id === postId ? update(post) : post,
            ),
          })),
        }
      : data,
  );
}

export function removePostFromFeed(queryClient: QueryClient, postId: string) {
  queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            content: page.content.filter((post) => post.id !== postId),
          })),
        }
      : data,
  );
}

export function prependPostToFeed(
  queryClient: QueryClient,
  post: PostResponse,
) {
  queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, (data) => {
    if (!data || data.pages.length === 0) return data;
    const [first, ...rest] = data.pages;
    return {
      ...data,
      pages: [{ ...first, content: [post, ...first.content] }, ...rest],
    };
  });
}

export function flattenFeed(data: FeedData | undefined): PostResponse[] {
  if (!data) return [];
  const seen = new Set<string>();
  const posts: PostResponse[] = [];
  for (const page of data.pages) {
    for (const post of page.content) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        posts.push(post);
      }
    }
  }
  return posts;
}
