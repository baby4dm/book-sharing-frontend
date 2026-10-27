import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { Link } from "react-router-dom";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconClock,
  IconStarFilled,
} from "@tabler/icons-react";
import { DELIVERY_METHODS, EXCHANGE_STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import UserLink from "@/features/userProfile/components/UserLink";
import type { ExchangeResponse } from "../types";
import {
  getActionHint,
  getMetaLine,
  getPendingAction,
} from "../utils/exchangeListItem";
import BookCardCover from "@/components/layout/BookCardCover";

interface ExchangeCardProps {
  exchange: ExchangeResponse;
  currentUserId: string;
}

const TONE_CLASSES = {
  default: "text-muted-foreground",
  warning: "text-warning",
  danger: "text-destructive",
} as const;

export default function ExchangeCard({
  exchange,
  currentUserId,
}: ExchangeCardProps) {

  const isOwner = exchange.ownerId === currentUserId;
  const partner = isOwner ? exchange.reader : exchange.owner;
  const status = EXCHANGE_STATUS_CONFIG[exchange.status];
  const meta = getMetaLine(exchange, isOwner);
  const action = getPendingAction(exchange, currentUserId);
  const MetaIcon = meta.tone === "danger" ? IconAlertTriangle : IconClock;

  return (
    <article className="relative flex w-full max-w-220 flex-col gap-4 surface surface-interactive p-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring sm:flex-row md:gap-5 md:p-5">
      <BookCardCover src={exchange.bookCoverUrl} />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="book-title text-lg leading-tight text-foreground md:text-xl">
            <Link
              to={`/exchanges/${exchange.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-['']"
            >
              {exchange.bookTitle}
            </Link>
          </h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
              status.color,
              status.bgColor,
            )}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          <UserLink
            userId={partner.id}
            className="relative z-10 inline-flex items-center gap-2.5"
          >
            <UserAvatar name={partner.name} src={partner.avatarUrl} seed={partner.id} className="size-8" fallbackClassName="text-[13px]" />
            <span className="text-[15px] font-semibold text-foreground underline-offset-2 group-hover:underline">
              {partner.name}
            </span>
          </UserLink>
          <span className="flex items-center gap-1 text-muted-foreground">
            <IconStarFilled size={13} className="text-star" />
            {Number(partner.ratingAvg).toFixed(1)}
          </span>
          <span className="rounded-full bg-tint-neutral px-2 py-0.5 text-xs font-medium text-tint-neutral-ink">
            {isOwner ? "Ви — власник" : "Ви — читач"}
          </span>
          <span className="text-[13px] text-muted-foreground">
            · {DELIVERY_METHODS[exchange.deliveryMethod]}
          </span>
        </div>

        <p
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            TONE_CLASSES[meta.tone],
          )}
        >
          <MetaIcon size={15} />
          {meta.text}
        </p>

        {action && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-accent px-3.5 py-2.5 text-sm leading-snug font-semibold text-accent-foreground">
            {getActionHint(action, exchange)}
            <IconArrowRight size={16} className="shrink-0" />
          </div>
        )}
      </div>
    </article>
  );
}
