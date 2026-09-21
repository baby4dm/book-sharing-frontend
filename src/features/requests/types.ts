import type { DeliveryMethod } from "../listings/types";

export type RequestStatus = "PENDING" | "ACTIVE" | "REJECTED" | "CANCELLED";

export interface RequestResponse {
  id: string;
  listingId: string;
  listingBookTitle: string;
  requesterId: string;
  requesterName: string;
  requesterAvatarUrl: string | null;
  requesterRatingAvg: number;
  desiredDeadline: string;
  preferredDeliveryMethod: DeliveryMethod;
  message: string | null;
  status: RequestStatus;
  rejectComment: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface ListingRequestRequest {
  desiredDeadline: string;
  preferredDeliveryMethod: DeliveryMethod;
  message: string;
}