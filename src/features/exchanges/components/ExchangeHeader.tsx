import { useState } from "react";
import { IconBook, IconBox } from "@tabler/icons-react";
import { DELIVERY_METHODS, EXCHANGE_STATUS_CONFIG } from "@/lib/constants";
import type { ExchangeResponse } from "../types";

interface ExchangeHeaderProps {
  exchange: ExchangeResponse;
  isOverdue: boolean;
}

export default function ExchangeHeader({
  exchange,
  isOverdue,
}: ExchangeHeaderProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const displayStatus = isOverdue
    ? "OVERDUE"
    : exchange.status === "OVERDUE"
      ? "IN_READING"
      : exchange.status;
  const status = EXCHANGE_STATUS_CONFIG[displayStatus];

  return (
    <div className="flex w-full gap-4 md:gap-5">
      <div className="flex h-32 w-22 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary md:h-40 md:w-28">
        {exchange.bookCoverUrl && !coverFailed ? (
          <img
            src={exchange.bookCoverUrl}
            alt={exchange.bookTitle}
            className="size-full object-cover"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <IconBook size={28} className="text-muted-foreground" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-bold leading-tight md:text-3xl">
              {exchange.bookTitle}
            </h1>
            {exchange.bookAuthor && (
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                {exchange.bookAuthor}
              </p>
            )}
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold md:text-[13px] ${status.bgColor} ${status.color}`}
          >
            <status.icon size={14} className="stroke-[2.4]" />
            {status.label}
          </span>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
          <IconBox size={15} />
          {DELIVERY_METHODS[exchange.deliveryMethod]}
        </span>
      </div>
    </div>
  );
}
