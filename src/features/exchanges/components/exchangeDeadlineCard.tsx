import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconClockPause,
  IconClockPlus,
  IconHourglass,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn, formatDayMonth, pluralizeDays } from "@/lib/utils";
import type { ExchangeResponse } from "../types";
import type { DeadlineProgress } from "../utils/exchangeDeadline";
import {
  addDays,
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
  const isMail = exchange.deliveryMethod === "MAIL";

  if (!progress.started || !progress.end) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <IconHourglass size={17} />
          Термін читання
        </span>
        <span className="font-heading text-2xl leading-tight font-semibold md:text-[28px]">
          {pluralizeDays(exchange.readingDays)}
        </span>
        <p className="text-sm leading-snug text-muted-foreground">
          Відлік почнеться, коли{" "}
          {isOwner ? `${exchange.reader.name} підтвердить` : "ви підтвердите"}{" "}
          отримання книги. Час{isMail ? " доставки" : " до зустрічі"} не
          рахується.
        </p>
      </section>
    );
  }

  const {
    end,
    start,
    daysLeft,
    percent,
    isOverdue,
    paused,
    returnedAt,
    returnedLateDays,
  } = progress;
  const pending = getPendingExtension(exchange);
  const latestDecided = pending ? null : getLatestDecidedExtension(exchange);
  const wasExtended = exchange.extendedDeadline !== null;
  const baseDeadline = exchange.deadline;

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
            {isOverdue
              ? "Треба було повернути до"
              : isMail
                ? "Відправити назад до"
                : "Повернути до"}
          </span>
          <span className="font-heading text-2xl leading-tight font-semibold md:text-[28px]">
            {formatDayMonth(end)}
          </span>
          <span className="text-sm text-muted-foreground">
            {pluralizeDays(exchange.readingDays)} читання
            {start && ` · з ${formatDayMonth(start)}`}
          </span>
          {wasExtended && baseDeadline && (
            <span className="text-sm text-muted-foreground">
              <s>{formatDayMonth(baseDeadline)}</s> · початковий термін
            </span>
          )}
          {exchange.readingPausedDays > 0 && (
            <span className="text-sm text-muted-foreground">
              +{pluralizeDays(exchange.readingPausedDays)} — поки власник
              вказував адресу
            </span>
          )}
        </div>
        {wasExtended && !isOverdue && (
          <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
            Продовжено
          </span>
        )}
      </div>

      {returnedAt ? (
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
            Книгу {isMail ? "відправлено" : "повернено"}{" "}
            {formatDayMonth(returnedAt)}
            {returnedLateDays > 0
              ? ` — із запізненням на ${pluralizeDays(returnedLateDays)}`
              : " — вчасно"}
          </span>
        </div>
      ) : paused ? (
        <div className="flex items-start gap-2 rounded-xl bg-info/10 px-3.5 py-3 text-sm text-info">
          <IconClockPause size={16} className="mt-0.5 shrink-0" />
          <span>
            {isOwner
              ? "Відлік читача на паузі, доки ви не вкажете адресу для повернення."
              : `Відлік на паузі: чекаємо, поки ${exchange.owner.name} вкаже адресу для повернення. Ці дні не рахуються.`}
          </span>
        </div>
      ) : (
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
            +<strong>{pluralizeDays(pending.extraDays)}</strong> — орієнтовно до{" "}
            {formatDayMonth(addDays(end, pending.extraDays))}.{" "}
            {isOwner
              ? "Рішення — у блоці вище."
              : `Чекаємо відповіді ${exchange.owner.name}.`}
          </span>
        </div>
      )}

      {latestDecided?.status === "APPROVED" && !isOwner && (
        <div className="flex items-start gap-2 rounded-xl bg-accent px-3.5 py-3 text-sm text-accent-foreground">
          <IconCheck size={16} className="mt-0.5 shrink-0" />
          Продовження на {pluralizeDays(latestDecided.extraDays)} схвалено —
          новий термін уже діє.
        </div>
      )}
      {latestDecided?.status === "REJECTED" && !isOwner && (
        <div className="flex flex-col gap-1 rounded-xl bg-destructive/5 px-3.5 py-3">
          <span className="flex items-center gap-1.5 text-sm font-bold text-destructive">
            <IconX size={16} />
            Запит на продовження відхилено
          </span>
          {latestDecided.decisionComment && (
            <span className="text-sm text-foreground/80">
              «{latestDecided.decisionComment}»
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
