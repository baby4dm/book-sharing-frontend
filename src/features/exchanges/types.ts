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
  uploadedBy: string;
  stage: "HANDOVER" | "RETURN";
  url: string;
  note: string | null;
  createdAt: string;
}

export interface ShipmentInfoResponse {
  id: string;
  direction: "TO_READER" | "TO_OWNER";
  recipientName: string;
  recipientPhone: string;
  carrier: "NOVA_POSHTA" | "UKRPOSHTA" | "OTHER";
  city: string;
  branchNumber: string;
  waybillPhotoUrl: string | null;
  status: "PENDING" | "SHIPPED" | "DELIVERED";
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
  shipments: ShipmentInfoResponse[];
  extensionRequests: DeadlineExtensionResponse[];
  createdAt: string;
  completedAt: string | null;
}
