import {
  IconArrowRight,
  IconClock,
  IconPackage,
  IconUsers,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { RequestResponse } from "../types";
import { REQUEST_STATUS_CONFIG } from "../types";
import { DELIVERY_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useListing } from "@/features/listings/hooks/useListing";
import { useCancelRequest } from "../hooks/cancelRequest";
import { cn } from "cn";
import { pluralizeDays } from "@/lib/utils";
import BookCardCover from "@/components/layout/BookCardCover";

interface RequestCardProps {
  request: RequestResponse;
}

function formatDate(date: string) {
  const value = date.length === 10 ? `${date}T00:00:00` : date;
  return new Date(value).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
  });
}

export default function SentRequestCard({ request }: RequestCardProps) {
  const statusData = REQUEST_STATUS_CONFIG[request.status];
  const { mutate: cancel, isPending } = useCancelRequest();

  const { data: listing } = useListing(request.listingId);
  const coverUrl = listing?.bookCoverUrl;

  const isPendingStatus = request.status === "PENDING";
  const isCancelled = request.status === "CANCELLED";
  const DeliveryIcon =
    request.preferredDeliveryMethod === "MAIL" ? IconPackage : IconUsers;

  return (
    <article
      className={cn(
        "flex w-full max-w-220 flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row md:gap-5 md:p-5",
        isCancelled ? "bg-card/60" : "bg-card",
      )}
    >
      <BookCardCover
        src={coverUrl}
        to={`/listings/${request.listingId}`}
        dimmed={isCancelled}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/listings/${request.listingId}`}
              className={cn(
                "font-heading text-lg font-semibold leading-tight hover:underline md:text-xl",
                isCancelled ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {request.listingBookTitle}
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {listing?.ownerName
                ? `Власник · ${listing.ownerName}`
                : `Надіслано ${formatDate(request.createdAt)}`}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold md:text-[13px]",
              statusData.color,
              statusData.bgColor,
            )}
          >
            <statusData.icon size={14} className="stroke-[2.4]" />
            {statusData.label}
          </span>
        </div>

        {!isCancelled && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-[13px] font-semibold text-muted-foreground">
              <IconClock size={15} className="text-accent-vivid" />
              {pluralizeDays(request.readingDays)} на читання
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-[13px] font-semibold text-muted-foreground">
              <DeliveryIcon size={15} className="text-accent-vivid" />
              {DELIVERY_METHODS[request.preferredDeliveryMethod]}
            </span>

            {isPendingStatus && (
              <Button
                variant="outline"
                onClick={() => cancel(request.id)}
                disabled={isPending}
                className="h-11 w-full cursor-pointer rounded-lg px-4 font-semibold sm:ml-auto sm:h-10 sm:w-auto"
              >
                {isPending ? "Скасування..." : "Скасувати заявку"}
              </Button>
            )}
          </div>
        )}

        {request.status === "REJECTED" && request.rejectComment?.trim() && (
          <div className="flex flex-col gap-1 rounded-lg bg-destructive/5 px-3.5 py-3">
            <span className="text-xs font-bold uppercase tracking-wide text-destructive">
              Причина
            </span>
            <p className="text-sm leading-relaxed text-foreground/80">
              {request.rejectComment}
            </p>
          </div>
        )}

        {request.status === "ACTIVE" && (
          <Link
            to={
              request.exchangeId
                ? `/exchanges/${request.exchangeId}`
                : "/exchanges"
            }
            className="inline-flex h-10 w-fit items-center gap-1.5 text-sm font-bold text-accent-vivid hover:underline"
          >
            Перейти до обміну
            <IconArrowRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}
