import { IconClock, IconCheck, IconX, IconBan } from "@tabler/icons-react";
import type { ComponentType } from "react";
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
    color: "text-warning",
    bgColor: "bg-warning/10",
    icon: IconClock,
  },
  ACTIVE: {
    label: "Підтверджено",
    color: "text-success",
    bgColor: "bg-success/10",
    icon: IconCheck,
  },
  REJECTED: {
    label: "Відхилено",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: IconX,
  },
  CANCELLED: {
    label: "Скасовано",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    icon: IconBan,
  },
};
