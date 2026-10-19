import type { Page } from "@/lib/types";
import apiClient from "./client";
import type {
  PostResponse,
  CreatePostPayload,
  PostLikeResponse,
  CommentResponse,
} from "@/features/feed/types";

export const FEED_PAGE_SIZE = 10;

export async function getPosts(page = 0): Promise<Page<PostResponse>> {
  const response = await apiClient.get<Page<PostResponse>>("/api/posts", {
    params: { page, size: FEED_PAGE_SIZE },
  });
  return response.data;
}

export async function createPost(
  payload: CreatePostPayload,
): Promise<PostResponse> {
  const response = await apiClient.post<PostResponse>("/api/posts", payload);
  return response.data;
}

export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/api/posts/${postId}`);
}

export async function likePost(postId: string): Promise<PostLikeResponse> {
  const response = await apiClient.put<PostLikeResponse>(
    `/api/posts/${postId}/like`,
  );
  return response.data;
}

export async function unlikePost(postId: string): Promise<PostLikeResponse> {
  const response = await apiClient.delete<PostLikeResponse>(
    `/api/posts/${postId}/like`,
  );
  return response.data;
}

export async function getComments(postId: string): Promise<CommentResponse[]> {
  const response = await apiClient.get<CommentResponse[]>(
    `/api/posts/${postId}/comments`,
  );
  return response.data;
}

export async function createComment(
  postId: string,
  content: string,
): Promise<CommentResponse> {
  const response = await apiClient.post<CommentResponse>(
    `/api/posts/${postId}/comments`,
    { content },
  );
  return response.data;
}
