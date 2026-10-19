import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, getComments } from "@/api/posts";
import type { CommentResponse } from "../types";
import { postCommentsKey, updatePostInFeed } from "../utils/feedCache";

export function usePostComments(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: postCommentsKey(postId),
    queryFn: () => getComments(postId),
    enabled,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createComment(postId, content),
    onSuccess: (comment) => {
      queryClient.setQueryData<CommentResponse[]>(
        postCommentsKey(postId),
        (comments) => (comments ? [...comments, comment] : [comment]),
      );
      updatePostInFeed(queryClient, postId, (post) => ({
        ...post,
        commentsCount: post.commentsCount + 1,
      }));
    },
  });
}
