import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconClock,
  IconStarFilled,
} from "@tabler/icons-react";
import { DELIVERY_METHODS, EXCHANGE_STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
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
  const [avatarFailed, setAvatarFailed] = useState(false);

  const isOwner = exchange.ownerId === currentUserId;
  const partner = isOwner ? exchange.reader : exchange.owner;
  const status = EXCHANGE_STATUS_CONFIG[exchange.status];
  const meta = getMetaLine(exchange, isOwner);
  const action = getPendingAction(exchange, currentUserId);
  const MetaIcon = meta.tone === "danger" ? IconAlertTriangle : IconClock;

  return (
    <Link
      to={`/exchanges/${exchange.id}`}
      className="flex w-full max-w-220 flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-accent-vivid/40 sm:flex-row md:gap-5 md:p-5"
    >
      <BookCardCover src={exchange.bookCoverUrl} />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold leading-tight text-foreground md:text-xl">
            {exchange.bookTitle}
          </h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold md:text-[13px]",
              status.color,
              status.bgColor,
            )}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-[13px] font-bold text-accent-foreground">
            {partner.avatarUrl && !avatarFailed ? (
              <img
                src={partner.avatarUrl}
                alt=""
                className="size-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              partner.name.substring(0, 1).toUpperCase()
            )}
          </div>
          <span className="text-[15px] font-semibold text-foreground">
            {partner.name}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <IconStarFilled size={13} className="text-[#D99A1E]" />
            {Number(partner.ratingAvg).toFixed(1)}
          </span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-foreground">
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
          <div className="flex items-center justify-between gap-2 rounded-lg bg-accent px-3.5 py-2.5 text-sm leading-snug font-semibold text-accent-vivid">
            {getActionHint(action, exchange)}
            <IconArrowRight size={16} className="shrink-0" />
          </div>
        )}
      </div>
    </Link>
  );
}
