import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, deletePost, likePost, unlikePost } from "@/api/posts";
import type { PostResponse } from "../types";
import {
  prependPostToFeed,
  removePostFromFeed,
  FEED_QUERY_KEY,
  updatePostInFeed,
} from "../utils/feedCache";

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: (post) => prependPostToFeed(queryClient, post),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, postId) => removePostFromFeed(queryClient, postId),
  });
}

export function useTogglePostLike(post: PostResponse) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (like: boolean) =>
      like ? likePost(post.id) : unlikePost(post.id),
    onMutate: async (like) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previous = {
        likedByMe: post.likedByMe,
        likesCount: post.likesCount,
      };
      updatePostInFeed(queryClient, post.id, (p) => ({
        ...p,
        likedByMe: like,
        likesCount: Math.max(0, p.likesCount + (like ? 1 : -1)),
      }));
      return previous;
    },
    onError: (_error, _like, previous) => {
      if (previous) {
        updatePostInFeed(queryClient, post.id, (p) => ({ ...p, ...previous }));
      }
    },
    onSuccess: (result) => {
      updatePostInFeed(queryClient, post.id, (p) => ({
        ...p,
        likedByMe: result.likedByMe,
        likesCount: result.likesCount,
      }));
    },
  });
}
