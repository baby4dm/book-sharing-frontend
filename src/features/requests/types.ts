import { IconClock, IconCheck, IconX, IconBan } from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { DeliveryMethod } from "../listings/types";

export type RequestStatus = "PENDING" | "ACTIVE" | "REJECTED" | "CANCELLED";
export type RequestSort = "NEWEST" | "OLDEST" | "DEADLINE" | "RATING";
export type RequestScope = "received" | "sent";

export interface RequestListResponse {
  items: RequestResponse[];
  statusCounts: Record<RequestStatus, number>;
  total: number;
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface RequestFilters {
  q: string;
  deliveryMethod: DeliveryMethod | null;
  status: RequestStatus | null;
  sort: RequestSort;
  page: number;
}

export const INITIAL_REQUEST_FILTERS: RequestFilters = {
  q: "",
  deliveryMethod: null,
  status: null,
  sort: "NEWEST",
  page: 0,
};

export type RequestFilterPatch = Partial<Omit<RequestFilters, "q">>;

export interface RequestResponse {
  id: string;
  listingId: string;
  listingBookTitle: string;
  requesterId: string;
  requesterName: string;
  requesterAvatarUrl: string | null;
  requesterRatingAvg: number;
  readingDays: number;
  preferredDeliveryMethod: DeliveryMethod;
  message: string | null;
  status: RequestStatus;
  rejectComment: string | null;
  createdAt: string;
  decidedAt: string | null;
  exchangeId: string | null;
}

export interface ListingRequestRequest {
  readingDays: number;
  preferredDeliveryMethod: DeliveryMethod;
  message: string;
}

export const REQUEST_STATUS_CONFIG: Record<
  RequestStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }
> = {
  PENDING: {
    label: "Очікує рішення",
    color: "text-tint-amber-ink",
    bgColor: "bg-tint-amber",
    icon: IconClock,
  },
  ACTIVE: {
    label: "Підтверджено",
    color: "text-tint-green-ink",
    bgColor: "bg-tint-green",
    icon: IconCheck,
  },
  REJECTED: {
    label: "Відхилено",
    color: "text-tint-red-ink",
    bgColor: "bg-tint-red",
    icon: IconX,
  },
  CANCELLED: {
    label: "Скасовано",
    color: "text-tint-neutral-ink",
    bgColor: "bg-tint-neutral",
    icon: IconBan,
  },
};
