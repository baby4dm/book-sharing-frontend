import type { ListingStatus } from "@/features/listings/types";
import type { RequestResponse } from "@/features/requests/types";

export function getActiveRequests(
  requests: RequestResponse[],
  listingStatus: ListingStatus,
): RequestResponse[] {
  const bookIsBusy =
    listingStatus === "RESERVED" || listingStatus === "IN_EXCHANGE";
  const current = bookIsBusy
    ? requests
        .filter((r) => r.status === "ACTIVE")
        .sort((a, b) =>
          (b.decidedAt ?? b.createdAt).localeCompare(
            a.decidedAt ?? a.createdAt,
          ),
        )[0]
    : undefined;
  const active = current ? [current] : [];
  const pending = requests
    .filter((r) => r.status === "PENDING")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return [...active, ...pending];
}

export function findMyActiveRequest(
  requests: RequestResponse[] | undefined,
  listingStatus: ListingStatus,
  userId: string | null | undefined,
): RequestResponse | null {
  if (!requests || !userId) return null;
  return (
    getActiveRequests(requests, listingStatus).find(
      (r) => r.requesterId === userId,
    ) ?? null
  );
}
