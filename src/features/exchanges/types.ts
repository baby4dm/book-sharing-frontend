import type { DeliveryMethod } from "../listings/types";

export type ExchangeStatus =
  | "HANDOVER_PENDING"
  | "IN_READING"
  | "RETURN_PENDING"
  | "COMPLETED"
  | "OVERDUE"
  | "DISPUTED";

export type ExchangeRole = "ALL" | "OWNER" | "READER";
export type ExchangeSort = "DEADLINE" | "NEWEST" | "OLDEST";

export interface ExchangeParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
  ratingAvg: number;
  booksGiven: number;
  booksTaken: number;
  booksOverdue: number;
}

export interface ExchangePhotoResponse {
  id: string;
  uploadedByUserId: string;
  uploadedByName: string;
  stage: "HANDOVER" | "RETURN" | "DISPUTE";
  url: string;
  note: string | null;
  createdAt: string;
}

export type ShipmentDirection = "TO_READER" | "TO_OWNER";
export type ShipmentStatus = "PENDING" | "SHIPPED" | "DELIVERED";
export type ShipmentCarrier = "NOVA_POSHTA" | "UKRPOSHTA" | "OTHER";

export interface ShipmentInfoResponse {
  id: string;
  direction: ShipmentDirection;
  recipientName: string;
  recipientPhone: string;
  carrier: ShipmentCarrier;
  city: string;
  branchNumber: string;
  waybillPhotoUrl: string | null;
  status: ShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface DeadlineExtensionResponse {
  id: string;
  extraDays: number;
  requestedNewDeadline: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comment: string | null;
  decisionComment: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface ExchangeResponse {
  id: string;
  listingId: string;
  bookTitle: string;
  ownerId: string;
  ownerName: string;
  readerId: string;
  readerName: string;
  deliveryMethod: DeliveryMethod;
  deadline: string | null;
  extendedDeadline: string | null;
  status: ExchangeStatus;
  handoverPhotos: ExchangePhotoResponse[];
  returnPhotos: ExchangePhotoResponse[];
  disputePhotos: ExchangePhotoResponse[];
  shipments: ShipmentInfoResponse[];
  extensionRequests: DeadlineExtensionResponse[];
  createdAt: string;
  completedAt: string | null;
  disputeReason: string | null;
  bookAuthor: string | null;
  bookCoverUrl: string | null;
  owner: ExchangeParticipant;
  reader: ExchangeParticipant;
  reviews?: ExchangeReviewResponse[];
  readingDays: number;
  readingStartedAt: string | null;
  readingPausedDays: number;
  dueDate: string | null;
  returnPreparedAt: string | null;
  returnedAt: string | null;
  readingPaused: boolean;
  dispute: ExchangeDisputeResponse | null;
}

export type DisputeStatus =
  | "OPEN"
  | "RESOLVED_FAVOR_FILER"
  | "RESOLVED_FAVOR_OTHER"
  | "DISMISSED";

export interface ExchangeDisputeResponse {
  id: string;
  filedByUserId: string;
  description: string;
  status: DisputeStatus;
  resolutionComment: string | null;
  moderatorName: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ExchangeReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  targetId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ExchangeListResponse {
  items: ExchangeResponse[];
  statusCounts: Record<ExchangeStatus, number>;
  total: number;
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface ExchangeFilters {
  q: string;
  role: ExchangeRole;
  deliveryMethod: DeliveryMethod | null;
  status: ExchangeStatus | null;
  sort: ExchangeSort;
  page: number;
}

export const INITIAL_EXCHANGE_FILTERS: ExchangeFilters = {
  q: "",
  role: "ALL",
  deliveryMethod: null,
  status: null,
  sort: "DEADLINE",
  page: 0,
};

export type ExchangeFilterPatch = Partial<Omit<ExchangeFilters, "q">>;

export interface SubmitPhotosPayload {
  urls: string[];
}

export interface CreateShipmentPayload {
  direction: ShipmentDirection;
  recipientName: string;
  recipientPhone: string;
  carrier: ShipmentCarrier;
  city: string;
  branchNumber: string;
}

export interface ShipWaybillPayload {
  waybillPhotoUrl: string;
}

export interface OpenDisputePayload {
  reason: string;
  urls: string[];
}

export interface RequestExtensionPayload {
  extraDays: number;
  comment: string | null;
}

export interface RejectExtensionPayload {
  comment: string | null;
}

export interface CreateReviewPayload {
  rating: number;
  comment: string | null;
}

export interface ReviewResponse {
  id: string;
  exchangeId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  targetId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}
