import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconClockPlus,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn, formatDayMonth, pluralizeDays } from "@/lib/utils";
import type { ExchangeResponse } from "../types";
import type { DeadlineProgress } from "../utils/exchangeDeadline";
import {
  daysBetween,
  getLatestDecidedExtension,
  getPendingExtension,
} from "../utils/extensions";

interface ExchangeDeadlineCardProps {
  exchange: ExchangeResponse;
  progress: DeadlineProgress;
  isOwner: boolean;
  canRequestExtension: boolean;
  onRequestExtension: () => void;
}

export default function ExchangeDeadlineCard({
  exchange,
  progress,
  isOwner,
  canRequestExtension,
  onRequestExtension,
}: ExchangeDeadlineCardProps) {
  const { end, daysLeft, percent, isOverdue, returnedAt, returnedLateDays } =
    progress;
  const pending = getPendingExtension(exchange);
  const latestDecided = pending ? null : getLatestDecidedExtension(exchange);
  const wasExtended = exchange.extendedDeadline !== null;

  const tone = isOverdue ? "danger" : daysLeft <= 3 ? "warning" : "ok";

  const label = isOverdue
    ? `Прострочено на ${pluralizeDays(daysLeft)}`
    : daysLeft === 0
      ? "Сьогодні останній день"
      : `Залишилось ${pluralizeDays(daysLeft)}`;

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-5",
        isOverdue ? "border-destructive/30" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold",
              isOverdue ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <IconCalendar size={17} />
            {isOverdue ? "Треба було повернути до" : "Повернути до"}
          </span>
          <span className="font-heading text-2xl font-semibold leading-tight md:text-[28px]">
            {formatDayMonth(end)}
          </span>
          {wasExtended && (
            <span className="text-sm text-muted-foreground">
              <s>{formatDayMonth(exchange.deadline)}</s> · початковий термін
            </span>
          )}
        </div>
        {wasExtended && !isOverdue && (
          <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
            Продовжено
          </span>
        )}
      </div>

      {returnedAt && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm",
            returnedLateDays > 0
              ? "bg-destructive/5 text-destructive"
              : "bg-accent text-accent-foreground",
          )}
        >
          <IconCheck size={16} className="mt-0.5 shrink-0" />
          <span>
            Книгу{" "}
            {exchange.deliveryMethod === "MAIL" ? "відправлено" : "повернено"}{" "}
            {formatDayMonth(returnedAt)}
            {returnedLateDays > 0
              ? ` — із запізненням на ${pluralizeDays(returnedLateDays)}`
              : " — вчасно"}
          </span>
        </div>
      )}

      {!returnedAt && (
        <div className="flex flex-col gap-1.5">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={isOverdue ? 100 : percent}
            aria-label="Час на читання"
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                tone === "danger" && "bg-destructive",
                tone === "warning" && "bg-warning",
                tone === "ok" && "bg-primary",
              )}
              style={{ width: `${isOverdue ? 100 : percent}%` }}
            />
          </div>
          <span
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold",
              tone === "danger" && "text-destructive",
              tone === "warning" && "text-warning",
              tone === "ok" && "text-muted-foreground",
            )}
          >
            <IconClock size={15} />
            {label}
          </span>
        </div>
      )}

      {pending && (
        <div className="flex flex-col gap-1 rounded-xl bg-warning/10 px-3.5 py-3">
          <span className="flex items-center gap-1.5 text-sm font-bold text-warning">
            <IconClockPlus size={16} />
            {isOwner ? "Читач просить більше часу" : "Запит надіслано"}
          </span>
          <span className="text-sm text-foreground/80">
            До <strong>{formatDayMonth(pending.requestedNewDeadline)}</strong>{" "}
            (+{pluralizeDays(daysBetween(end, pending.requestedNewDeadline))}).{" "}
            {isOwner
              ? "Рішення — у блоці нижче."
              : `Чекаємо відповіді ${exchange.owner.name}.`}
          </span>
        </div>
      )}

      {latestDecided?.status === "APPROVED" && !isOwner && (
        <div className="flex items-start gap-2 rounded-xl bg-accent px-3.5 py-3 text-sm text-accent-foreground">
          <IconCheck size={16} className="mt-0.5 shrink-0" />
          Продовження схвалено — новий термін уже діє.
        </div>
      )}
      {latestDecided?.status === "REJECTED" && !isOwner && (
        <div className="flex flex-col gap-1 rounded-xl bg-destructive/5 px-3.5 py-3">
          <span className="flex items-center gap-1.5 text-sm font-bold text-destructive">
            <IconX size={16} />
            Запит на продовження відхилено
          </span>
          {latestDecided.comment && (
            <span className="text-sm text-foreground/80">
              «{latestDecided.comment}»
            </span>
          )}
        </div>
      )}

      {canRequestExtension && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={onRequestExtension}
            className="h-11 w-full cursor-pointer gap-2 rounded-lg border-primary font-bold text-primary hover:bg-accent hover:text-accent-foreground"
          >
            <IconClockPlus size={18} />
            Попросити більше часу
          </Button>
          <p className="text-[13px] leading-snug text-muted-foreground">
            {exchange.owner.name} отримає запит і вирішить. Поки не відповів —
            діє поточна дата.
          </p>
        </div>
      )}
    </section>
  );
}
