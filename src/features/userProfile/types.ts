import type { SettlementType } from "../listings/types";

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  settlementType: SettlementType | null;
  region: string | null;
  settlementName: string | null;
  bio: string | null;
  ratingAvg: number;
  booksTaken: number;
  booksReturnedOnTime: number;
  booksOverdue: number;
  booksDamaged: number;
  booksGiven: number;
  role: "USER" | "MODERATOR" | "ADMIN";
  status: "ACTIVE" | "RESTRICTED" | "BLOCKED";
  restrictedUntil: string | null;
  createdAt: string;
}

export type PublicUserProfile = Omit<
  UserResponse,
  "email" | "status" | "restrictedUntil"
>;

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
  settlementType?: SettlementType;
  region?: string;
  settlementName?: string;
  bio?: string;
}

export interface UserReview {
  id: string;
  exchangeId: string;
  bookTitle: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  authorRole: "OWNER" | "READER";
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface UserReviewListResponse {
  items: UserReview[];
  page: number;
  totalPages: number;
  totalElements: number;
}
