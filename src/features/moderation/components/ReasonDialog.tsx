import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import { cn } from "@/lib/utils";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  /** Готові причини — клік підставляє текст у поле */
  quickReasons?: string[];
  destructive?: boolean;
  onConfirm: (reason: string) => Promise<unknown>;
}

const MAX = 1000;

/**
 * Діалог дії модератора з обов'язковою причиною. Причину побачить автор
 * у сповіщенні, тому вона пишеться для людини, а не для журналу.
 */
export default function ReasonDialog(props: ReasonDialogProps) {
  const { open, onOpenChange } = props;
  const [pending, setPending] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="gap-5 sm:max-w-lg">
        {/* тіло монтується заново при кожному відкритті — поле й помилка скидаються самі */}
        {open && <ReasonDialogBody {...props} onPendingChange={setPending} />}
      </DialogContent>
    </Dialog>
  );
}

function ReasonDialogBody({
  onOpenChange,
  title,
  description,
  confirmLabel,
  quickReasons = [],
  destructive = true,
  onConfirm,
  onPendingChange,
}: ReasonDialogProps & { onPendingChange: (pending: boolean) => void }) {
  const id = useId();
  const [reason, setReason] = useState("");
  const [pending, setPendingState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  function setPending(value: boolean) {
    setPendingState(value);
    onPendingChange(value);
  }

  const trimmed = reason.trim();
  const invalid = touched && trimmed.length === 0;

  async function handleConfirm() {
    setTouched(true);
    if (!trimmed || pending) return;
    setPending(true);
    setError(null);
    try {
      await onConfirm(trimmed);
      onOpenChange(false);
    } catch (e) {
      setError(
        getErrorMessage(e, "Не вдалося виконати дію. Спробуйте ще раз."),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="leading-relaxed">
          {description}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor={id} required>
          Причина
        </Label>
        {quickReasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {quickReasons.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setReason(q);
                  setTouched(true);
                }}
                className={cn(
                  "h-7 cursor-pointer rounded-md border px-2 text-xs font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  trimmed === q
                    ? "border-ring/40 bg-accent text-accent-foreground"
                    : "border-input bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <Textarea
          id={id}
          value={reason}
          maxLength={MAX}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={invalid || undefined}
          placeholder="Коротко поясніть, що не так — автор побачить це в сповіщенні"
          className="min-h-24"
        />
        <div className="flex justify-between gap-3 text-xs">
          <span
            className={invalid ? "text-destructive" : "text-muted-foreground"}
          >
            {invalid
              ? "Вкажіть причину"
              : "Автор отримає сповіщення з цією причиною"}
          </span>
          <span className="tabular text-muted-foreground">
            {reason.length}/{MAX}
          </span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-tint-red px-3.5 py-2.5 text-sm text-tint-red-ink"
        >
          {error}
        </p>
      )}

      <DialogFooter>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          Скасувати
        </Button>
        <Button
          variant={destructive ? "destructive" : "default"}
          disabled={pending}
          onClick={handleConfirm}
        >
          {pending ? "Зачекайте…" : confirmLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
