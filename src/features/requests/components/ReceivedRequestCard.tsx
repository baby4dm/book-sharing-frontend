import { useState } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import {
  IconArrowRight,
  IconClock,
  IconPackage,
  IconStarFilled,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DELIVERY_METHODS } from "@/lib/constants";
import { formatRelativeTime, pluralizeDays } from "@/lib/utils";
import { useListing } from "@/features/listings/hooks/useListing";
import { useApproveRequest } from "../hooks/useApproveRequest";
import { REQUEST_STATUS_CONFIG } from "../types";
import type { RequestResponse } from "../types";
import RejectReasonDialog from "./RejectReasonDialog";
import UserLink from "@/features/userProfile/components/UserLink";
import { cn } from "cn";
import BookCardCover from "@/components/layout/BookCardCover";

interface RequestCardProps {
  request: RequestResponse;
}

export default function ReceivedRequestCard({ request }: RequestCardProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [rejectDialogIsOpen, setRejectDialogIsOpen] = useState(false);
  const {
    mutate: approve,
    isPending: isApproving,
    isError: isApprovingError,
    error: approvingError,
  } = useApproveRequest();

  const { data: listing } = useListing(request.listingId);
  const coverUrl = listing?.bookCoverUrl;

  const statusData = REQUEST_STATUS_CONFIG[request.status];
  const isPending = request.status === "PENDING";
  const isCancelled = request.status === "CANCELLED";
  const DeliveryIcon =
    request.preferredDeliveryMethod === "MAIL" ? IconPackage : IconUsers;

  const approveErrorMessage =
    approvingError instanceof AxiosError
      ? (approvingError.response?.data?.message ??
        "Не вдалось підтвердити заявку")
      : "Не вдалось підтвердити заявку";

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
          <Link
            to={`/listings/${request.listingId}`}
            className={cn(
              "font-heading text-lg font-semibold leading-tight hover:underline md:text-xl",
              isCancelled ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {request.listingBookTitle}
          </Link>
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

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          <UserLink
            userId={request.requesterId}
            className="inline-flex items-center gap-2.5"
          >
            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-[13px] font-bold text-accent-foreground">
              {request.requesterAvatarUrl && !avatarFailed ? (
                <img
                  src={request.requesterAvatarUrl}
                  alt=""
                  className="size-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                request.requesterName.substring(0, 1).toUpperCase()
              )}
            </div>
            <span className="text-[15px] font-semibold text-foreground underline-offset-2 group-hover:underline">
              {request.requesterName}
            </span>
          </UserLink>
          <span className="flex items-center gap-1 text-muted-foreground">
            <IconStarFilled size={13} className="text-[#D99A1E]" />
            {Number(request.requesterRatingAvg).toFixed(1)}
          </span>
          <span className="text-[13px] text-muted-foreground">
            · {formatRelativeTime(request.createdAt)}
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
          </div>
        )}

        {request.message?.trim() && (
          <p className="text-[15px] italic leading-relaxed text-muted-foreground">
            «{request.message}»
          </p>
        )}

        {request.status === "REJECTED" && request.rejectComment?.trim() && (
          <div className="flex flex-col gap-1 rounded-lg bg-destructive/5 px-3.5 py-3">
            <span className="text-xs font-bold uppercase tracking-wide text-destructive">
              Ваша причина відмови
            </span>
            <p className="text-sm leading-relaxed text-foreground/80">
              {request.rejectComment}
            </p>
          </div>
        )}

        {isApprovingError && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          >
            {approveErrorMessage}
          </p>
        )}

        {isPending && (
          <div className="mt-1 flex gap-2.5">
            <Button
              variant="outline"
              className="h-11 flex-1 cursor-pointer rounded-lg px-5 font-semibold sm:flex-none"
              disabled={isApproving}
              onClick={() => setRejectDialogIsOpen(true)}
            >
              Відхилити
            </Button>
            <Button
              className="h-11 flex-1 cursor-pointer rounded-lg px-6 font-bold sm:flex-none"
              disabled={isApproving}
              onClick={() => approve(request.id)}
            >
              {isApproving ? "Підтвердження..." : "Підтвердити"}
            </Button>
          </div>
        )}

        {request.status === "ACTIVE" && request.exchangeId && (
          <Link
            to={`/exchanges/${request.exchangeId}`}
            className="inline-flex h-10 w-fit items-center gap-1.5 text-sm font-bold text-accent-vivid hover:underline"
          >
            Перейти до обміну
            <IconArrowRight size={16} />
          </Link>
        )}
      </div>

      <RejectReasonDialog
        requestId={request.id}
        open={rejectDialogIsOpen}
        onOpenChange={setRejectDialogIsOpen}
      />
    </article>
  );
}
