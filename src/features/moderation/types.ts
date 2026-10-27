import type { DeliveryMethod } from "../listings/types";
import type { ExchangeParticipant, ExchangeStatus } from "../exchanges/types";
import type { UserResponse } from "../userProfile/types";

export type DisputeStatus =
  "OPEN" | "RESOLVED_FAVOR_FILER" | "RESOLVED_FAVOR_OTHER" | "DISMISSED";

export type DisputeDecision = Exclude<DisputeStatus, "OPEN">;

export interface ModerationSummary {
  openDisputes: number;
  newFeedback: number;
  restrictedUsers: number;
  hiddenListings: number;
}

export interface ModerationDispute {
  id: string;
  exchangeId: string;
  status: DisputeStatus;
  description: string;
  createdAt: string;
  resolvedAt: string | null;
  resolutionComment: string | null;
  moderatorName: string | null;
  filedById: string;
  filedByName: string;
  filedByOwner: boolean;
  bookTitle: string;
  bookAuthor: string | null;
  bookCoverUrl: string | null;
  exchangeStatus: ExchangeStatus;
  deliveryMethod: DeliveryMethod;
  owner: ExchangeParticipant;
  reader: ExchangeParticipant;
}

export type UserRole = UserResponse["role"];
export type UserStatus = UserResponse["status"];
export type RestrictionType = "TEMPORARY" | "PERMANENT";

export interface ModerationUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  restrictedUntil: string | null;
  ratingAvg: number;
  booksGiven: number;
  booksTaken: number;
  booksOverdue: number;
  booksDamaged: number;
  createdAt: string;
}

export interface Restriction {
  id: string;
  type: RestrictionType;
  reason: string | null;
  startsAt: string;
  endsAt: string | null;
  liftedAt: string | null;
  createdByName: string | null;
  liftedByName: string | null;
  disputeId: string | null;
  active: boolean;
}

export type ModerationActionType =
  | "RESOLVE_DISPUTE"
  | "HIDE_LISTING"
  | "RESTORE_LISTING"
  | "DELETE_POST"
  | "DELETE_COMMENT"
  | "RESTRICT_USER"
  | "BLOCK_USER"
  | "LIFT_RESTRICTION";

export type ModerationTargetType =
  "DISPUTE" | "LISTING" | "POST" | "COMMENT" | "USER";

export interface ModerationAction {
  id: string;
  action: ModerationActionType;
  targetType: ModerationTargetType;
  targetId: string | null;
  targetUserId: string | null;
  targetUserName: string | null;
  moderatorId: string | null;
  moderatorName: string | null;
  reason: string | null;
  details: string | null;
  createdAt: string;
}

export interface ModerationUserDetail {
  user: ModerationUser;
  restrictions: Restriction[];
  actions: ModerationAction[];
  disputesFiled: number;
  disputesAgainst: number;
}

/** Spring Page, як його серіалізує бекенд */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface RestrictUserPayload {
  type: RestrictionType;
  days?: number;
  reason: string;
}

export const DISPUTE_DECISION_LABELS: Record<DisputeDecision, string> = {
  RESOLVED_FAVOR_FILER: "На користь заявника",
  RESOLVED_FAVOR_OTHER: "На користь іншої сторони",
  DISMISSED: "Відхилити скаргу",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Активний",
  RESTRICTED: "Обмежений",
  BLOCKED: "Заблокований",
};

export const USER_STATUS_TONE: Record<UserStatus, string> = {
  ACTIVE: "bg-tint-neutral text-tint-neutral-ink",
  RESTRICTED: "bg-tint-amber text-tint-amber-ink",
  BLOCKED: "bg-tint-red text-tint-red-ink",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Користувач",
  MODERATOR: "Модератор",
  ADMIN: "Адміністратор",
};

export const ACTION_LABELS: Record<ModerationActionType, string> = {
  RESOLVE_DISPUTE: "Розглянуто скаргу",
  HIDE_LISTING: "Приховано оголошення",
  RESTORE_LISTING: "Повернуто оголошення",
  DELETE_POST: "Видалено пост",
  DELETE_COMMENT: "Видалено коментар",
  RESTRICT_USER: "Обмежено обліковий запис",
  BLOCK_USER: "Заблоковано обліковий запис",
  LIFT_RESTRICTION: "Знято обмеження",
};

export function isModeratorRole(role: UserRole | undefined | null): boolean {
  return role === "MODERATOR" || role === "ADMIN";
}
