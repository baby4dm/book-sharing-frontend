import { Link } from "react-router-dom";
import { IconArrowRight, IconStarFilled, IconUsers } from "@tabler/icons-react";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import type { ListingStatus } from "@/features/listings/types";
import { DELIVERY_METHODS } from "@/lib/constants";
import { cn, formatRelativeTime, pluralizeDays } from "@/lib/utils";
import { getActiveRequests } from "@/api/listingQueue";
import {
  type RequestResponse,
  REQUEST_STATUS_CONFIG,
} from "@/features/requests/types";

interface ListingRequestQueueProps {
  requests: RequestResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  listingStatus: ListingStatus;
  currentUserId: string | null;
  isOwner: boolean;
}

export default function ListingRequestQueue({
  requests,
  isLoading,
  isError,
  listingStatus,
  currentUserId,
  isOwner,
}: ListingRequestQueueProps) {
  const items = requests ? getActiveRequests(requests, listingStatus) : [];
  const pendingCount = items.filter((r) => r.status === "PENDING").length;

  return (
    <section
      aria-labelledby="queue-title"
      className="flex w-full flex-col gap-4 rounded-xl bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="queue-title"
          className="flex items-center gap-2 text-base font-bold lg:text-lg"
        >
          <IconUsers className="size-5 text-accent-vivid" />
          Заявки на книгу
          {items.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
              {items.length}
            </span>
          )}
        </h2>
        {isOwner && pendingCount > 0 && (
          <Link
            to="/requests"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent-vivid hover:underline"
          >
            Розглянути
            <IconArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3">
              <div className="size-10 rounded-full bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3.5 w-40 rounded bg-muted" />
                <div className="h-3 w-28 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">
          Не вдалося завантажити заявки.
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isOwner
            ? "Поки ніхто не подав заявку на цю книгу."
            : "Заявок поки немає — ваша може бути першою."}
        </p>
      ) : (
        <ol className="flex flex-col divide-y divide-border">
          {items.map((request) => {
            const isMine = request.requesterId === currentUserId;
            const isReading = request.status === "ACTIVE";
            const queuePosition = isReading
              ? null
              : items.filter((r) => r.status === "PENDING").indexOf(request) +
                1;
            const status = REQUEST_STATUS_CONFIG[request.status];

            return (
              <li
                key={request.id}
                className={cn(
                  "flex gap-3 py-3 first:pt-0 last:pb-0",
                  isMine &&
                    "-mx-2 rounded-lg bg-accent/50 px-2 first:pt-2 last:pb-2",
                )}
              >
                <span
                  className="w-5 shrink-0 pt-2.5 text-center text-sm font-extrabold text-muted-foreground"
                  aria-label={
                    queuePosition ? `${queuePosition}-й у черзі` : undefined
                  }
                >
                  {queuePosition ?? ""}
                </span>
                <UserAvatar
                  name={request.requesterName}
                  src={request.requesterAvatarUrl}
                  className="size-10"
                  fallbackClassName="font-sans text-sm font-extrabold"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-sm font-bold lg:text-[15px]">
                      {request.requesterName}
                      {isMine && (
                        <span className="font-semibold text-accent-vivid">
                          {" "}
                          · ви
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <IconStarFilled className="size-3.5 text-[#D99A1E]" />
                      {Number(request.requesterRatingAvg).toFixed(1)}
                    </span>
                    <span
                      className={cn(
                        "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                        status.bgColor,
                        status.color,
                      )}
                    >
                      <status.icon size={13} />
                      {isReading ? "Зараз читає" : status.label}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    {pluralizeDays(request.readingDays)} на читання ·{" "}
                    {DELIVERY_METHODS[request.preferredDeliveryMethod]} ·{" "}
                    {formatRelativeTime(request.createdAt)}
                  </p>
                  {isOwner && request.message?.trim() && (
                    <p className="text-sm leading-relaxed text-foreground/80 italic">
                      «{request.message}»
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
