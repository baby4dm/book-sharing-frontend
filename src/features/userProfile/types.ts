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

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
  settlementType?: SettlementType;
  region?: string;
  settlementName?: string;
  bio?: string;
}