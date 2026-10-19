export interface PostResponse {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  photoUrl: string | null;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface CreatePostPayload {
  content: string;
  photoUrl?: string;
}

export interface PostLikeResponse {
  postId: string;
  likesCount: number;
  likedByMe: boolean;
}

export interface CommentResponse {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

export const POST_MAX_LENGTH = 4000;
export const COMMENT_MAX_LENGTH = 2000;
