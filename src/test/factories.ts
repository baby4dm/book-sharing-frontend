import type { ExchangeResponse } from "@/features/exchanges/types";

export const OWNER = "owner-1";
export const READER = "reader-1";

export function exchange(patch: Partial<ExchangeResponse> = {}): ExchangeResponse {
  return {
    id: "ex-1", listingId: "l-1", bookTitle: "Місто", ownerId: OWNER, ownerName: "Власник",
    readerId: READER, readerName: "Читач", deliveryMethod: "PICKUP", deadline: null,
    extendedDeadline: null, status: "HANDOVER_PENDING", handoverPhotos: [], returnPhotos: [],
    disputePhotos: [], shipments: [], extensionRequests: [], createdAt: "2026-10-01T10:00:00",
    completedAt: null, disputeReason: null, bookAuthor: null, bookCoverUrl: null,
    readingDays: 14, readingStartedAt: null, readingPausedDays: 0, dueDate: null,
    returnPreparedAt: null, returnedAt: null, readingPaused: false, dispute: null,
    ...patch,
  } as ExchangeResponse;
}

export const photo = (by: string, createdAt = "2026-10-02T10:00:00") =>
  ({ id: `${by}-${createdAt}`, url: "/p.jpg", uploadedByUserId: by, createdAt }) as never;

export const shipment = (direction: "TO_READER" | "TO_OWNER", status: "PENDING" | "SHIPPED" | "DELIVERED", shippedAt: string | null = null) =>
  ({ id: `s-${direction}`, direction, status, shippedAt }) as never;
