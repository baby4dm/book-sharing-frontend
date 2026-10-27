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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDayMonth, pluralizeDays } from "@/lib/utils";
import type { ExchangeResponse, RequestExtensionPayload } from "../types";
import { addDays, getEffectiveDeadline } from "../utils/extensions";
import { getErrorMessage } from "../utils/getErrorMessage";
import RequiredMark from "@/components/ui/RequiredMark";

const MAX_COMMENT_LENGTH = 300;
const QUICK_DAYS = [3, 7, 14, 30] as const;
const MIN_DAYS = 1;
const MAX_DAYS = 60;

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
  const [extraDays, setExtraDays] = useState<number>(7);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = customMode ? Number(customValue) : extraDays;
  const daysValid =
    Number.isInteger(days) && days >= MIN_DAYS && days <= MAX_DAYS;
  const newDeadline =
    currentDeadline && daysValid ? addDays(currentDeadline, days) : null;

  function handleOpenChange(next: boolean) {
    if (isSubmitting) return;
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!daysValid) {
      setError(`Вкажіть від ${MIN_DAYS} до ${MAX_DAYS} днів`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ extraDays: days, comment: comment.trim() || null });
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const chipClass = (active: boolean) =>
    cn(
      "h-10 cursor-pointer rounded-lg border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      active
        ? "border-primary bg-accent text-accent-foreground"
        : "border-input bg-card hover:bg-muted",
    );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-5 overflow-y-auto p-6 sm:max-w-lg sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Попросити більше часу
          </DialogTitle>
          <DialogDescription>
            «{exchange.bookTitle}» · власник {exchange.owner.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-background px-4 py-3">
            <p className="text-[13px] text-muted-foreground">Зараз до</p>
            <p className="mt-0.5 font-bold">
              {currentDeadline ? formatDayMonth(currentDeadline) : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-accent px-4 py-3">
            <p className="text-[13px] text-accent-foreground">Буде до</p>
            <p className="mt-0.5 font-bold text-accent-foreground">
              {newDeadline ? formatDayMonth(newDeadline) : "—"}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2.5 text-sm font-semibold">
              На скільки днів продовжити? <RequiredMark />
            </legend>
            <div className="flex flex-wrap gap-2">
              {QUICK_DAYS.map((value) => {
                const active = !customMode && extraDays === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setExtraDays(value);
                      setCustomMode(false);
                      setError(null);
                    }}
                    className={chipClass(active)}
                  >
                    +{pluralizeDays(value)}
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={customMode}
                onClick={() => {
                  setCustomMode(true);
                  setCustomValue((v) => v || String(extraDays));
                  setError(null);
                }}
                className={chipClass(customMode)}
              >
                Інше
              </button>
            </div>
            {customMode && (
              <div className="flex items-center gap-2.5">
                <Label htmlFor="ext-days" className="sr-only">
                  Кількість днів
                </Label>
                <input
                  id="ext-days"
                  type="number"
                  inputMode="numeric"
                  min={MIN_DAYS}
                  max={MAX_DAYS}
                  autoFocus
                  value={customValue}
                  aria-invalid={!daysValid || undefined}
                  onChange={(e) => {
                    setCustomValue(e.target.value);
                    setError(null);
                  }}
                  className="h-11 w-28 rounded-lg border border-input bg-card px-3.5 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive"
                />
                <span className="text-sm text-muted-foreground">
                  днів (до {MAX_DAYS})
                </span>
              </div>
            )}
          </fieldset>

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
            Дні додаються до нього в момент підтвердження.
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
              className="h-10 rounded-lg px-5 font-semibold"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-lg px-6 font-semibold"
            >
              {isSubmitting ? "Надсилання..." : "Надіслати запит"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
