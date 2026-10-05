import type { SortOption } from "@/lib/types";
import type { DeliveryMethod } from "../listings/types";

export type ExchangeStatus =
  | "HANDOVER_PENDING"
  | "IN_READING"
  | "RETURN_PENDING"
  | "COMPLETED"
  | "OVERDUE"
  | "DISPUTED";

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
  requestedNewDeadline: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comment: string | null;
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
  deadline: string;
  extendedDeadline: string | null;
  status: ExchangeStatus;
  handoverPhotos: ExchangePhotoResponse[];
  returnPhotos: ExchangePhotoResponse[];
  disputePhotos: 
  shipments: ShipmentInfoResponse[];
  extensionRequests: DeadlineExtensionResponse[];
  createdAt: string;
  completedAt: string | null;
}

export interface ExchangeFilters {
  sort?: SortOption;
}
