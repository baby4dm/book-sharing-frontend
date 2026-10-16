import { useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDayMonth, pluralizeDays } from "@/lib/utils";
import type { ExchangeResponse, RequestExtensionPayload } from "../types";
import {
  addDays,
  daysBetween,
  getEffectiveDeadline,
  toDateInputValue,
} from "../utils/extensions";
import { getErrorMessage } from "../utils/getErrorMessage";

const MAX_COMMENT_LENGTH = 300;
const QUICK_DAYS = [7, 14, 30] as const;

interface ExtensionRequestDialogProps {
  exchange: ExchangeResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: RequestExtensionPayload) => Promise<unknown>;
}

export default function ExtensionRequestDialog({
  exchange,
  open,
  onOpenChange,
  onSubmit,
}: ExtensionRequestDialogProps) {
  const currentDeadline = getEffectiveDeadline(exchange);
  const [today] = useState(() => toDateInputValue(new Date()));
  const minDate = addDays(currentDeadline > today ? currentDeadline : today, 1);

  const [newDeadline, setNewDeadline] = useState(() => {
    const suggested = addDays(currentDeadline, 14);
    return suggested >= minDate ? suggested : addDays(minDate, 13);
  });
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extraDays = newDeadline ? daysBetween(currentDeadline, newDeadline) : 0;

  function handleOpenChange(next: boolean) {
    if (isSubmitting) return;
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!newDeadline) {
      setError("Оберіть нову дату повернення");
      return;
    }
    if (newDeadline < minDate) {
      setError(`Нова дата має бути не раніше ${formatDayMonth(minDate)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        newDeadline,
        comment: comment.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-5 overflow-y-auto rounded-2xl p-6 sm:max-w-lg sm:p-7">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold">
            Попросити більше часу
          </DialogTitle>
          <DialogDescription>
            «{exchange.bookTitle}» · власник {exchange.owner.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Поточний дедлайн
          </span>
          <span className="font-bold">{formatDayMonth(currentDeadline)}</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="ext-date" className="text-sm font-semibold">
              Нова дата повернення
            </Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_DAYS.map((days) => {
                const value = addDays(currentDeadline, days);
                const disabled = value < minDate;
                const isActive = newDeadline === value;
                return (
                  <button
                    key={days}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isActive}
                    onClick={() => {
                      setNewDeadline(value);
                      setError(null);
                    }}
                    className={cn(
                      "h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      isActive
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-input bg-card hover:bg-muted",
                    )}
                  >
                    +{days} днів
                  </button>
                );
              })}
            </div>
            <Input
              id="ext-date"
              type="date"
              min={minDate}
              value={newDeadline}
              onChange={(e) => {
                setNewDeadline(e.target.value);
                setError(null);
              }}
              className="h-12 rounded-lg border-input px-3.5 text-[15px]"
            />
            {extraDays > 0 && (
              <span className="text-[13px] font-semibold text-accent-vivid">
                +{pluralizeDays(extraDays)} до поточного терміну
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ext-comment" className="text-sm font-semibold">
              Коментар для власника{" "}
              <span className="font-normal text-muted-foreground">
                (необов'язково)
              </span>
            </Label>
            <Textarea
              id="ext-comment"
              rows={4}
              maxLength={MAX_COMMENT_LENGTH}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Наприклад: захворів і тиждень не читав, лишилось ~150 сторінок"
              className="resize-none rounded-lg border-input px-3.5 py-3 text-[15px] leading-relaxed"
            />
            <span className="self-end text-xs text-muted-foreground">
              {comment.length} / {MAX_COMMENT_LENGTH}
            </span>
          </div>

          <p className="flex gap-2 text-sm text-muted-foreground">
            <IconInfoCircle size={18} className="mt-px shrink-0" />
            Поки {exchange.owner.name} не відповів(ла), діє поточний дедлайн.
            Одночасно може бути лише один запит.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              className="h-12 cursor-pointer rounded-lg px-5 font-semibold"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 cursor-pointer rounded-lg px-6 font-bold"
            >
              {isSubmitting ? "Надсилання..." : "Надіслати запит"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
