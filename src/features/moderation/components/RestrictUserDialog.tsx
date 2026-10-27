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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SegmentedControl from "@/components/ui/segmented";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import { cn } from "@/lib/utils";
import { useRestrictUser } from "../hooks/useModeration";
import type { RestrictionType } from "../types";
import { formatDate, pluralDays } from "../utils";

const DAY_PRESETS = [3, 7, 14, 30];

const QUICK_REASONS = [
  "Систематично не повертає книги вчасно",
  "Пошкодив книгу й ухиляється від відповідальності",
  "Образливі повідомлення іншим користувачам",
  "Спам або реклама",
];

interface RestrictUserDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: RestrictionType;
}

/**
 * Тимчасове обмеження (не може додавати книги, подавати заявки й писати
 * в спільноті, але завершує поточні обміни) або блокування облікового запису.
 */
export default function RestrictUserDialog(props: RestrictUserDialogProps) {
  const { open, onOpenChange } = props;
  const [pending, setPending] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="gap-5 sm:max-w-lg">
        {/* тіло монтується заново при кожному відкритті — форма скидається сама */}
        {open && <RestrictUserBody {...props} onPendingChange={setPending} />}
      </DialogContent>
    </Dialog>
  );
}

function RestrictUserBody({
  userId,
  userName,
  onOpenChange,
  initialType = "TEMPORARY",
  onPendingChange,
}: RestrictUserDialogProps & { onPendingChange: (pending: boolean) => void }) {
  const id = useId();
  const [type, setType] = useState<RestrictionType>(initialType);
  const [days, setDays] = useState("7");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  // «зараз» фіксуємо при відкритті, щоб підказка «до …» не стрибала між рендерами
  const [openedAt] = useState(() => Date.now());
  const restrict = useRestrictUser(userId, {
    onSettled: () => onPendingChange(false),
  });

  const daysNumber = Number(days);
  const daysValid =
    Number.isInteger(daysNumber) && daysNumber >= 1 && daysNumber <= 365;
  const reasonMissing = touched && reason.trim().length === 0;
  const daysInvalid = touched && type === "TEMPORARY" && !daysValid;
  const until = daysValid
    ? new Date(openedAt + daysNumber * 86_400_000).toISOString()
    : null;
  const permanent = type === "PERMANENT";

  function submit() {
    setTouched(true);
    if (!reason.trim() || (!permanent && !daysValid)) return;
    onPendingChange(true);
    restrict.mutate(
      {
        type,
        days: permanent ? undefined : daysNumber,
        reason: reason.trim(),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle>Обмежити {userName}</DialogTitle>
        <DialogDescription className="leading-relaxed">
          {permanent
            ? "Обліковий запис буде заблоковано: людина не зможе увійти, доки обмеження не знімуть."
            : "Людина зможе завершити поточні обміни, але не зможе додавати книги, подавати заявки й писати в спільноті."}
        </DialogDescription>
      </DialogHeader>

      <SegmentedControl
        aria-label="Тип обмеження"
        className="w-full"
        value={type}
        onChange={setType}
        options={[
          { value: "TEMPORARY", label: "Тимчасово" },
          { value: "PERMANENT", label: "Заблокувати" },
        ]}
      />

      {!permanent && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-days`} required>
            На скільки днів
          </Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {DAY_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={days === String(d)}
                onClick={() => setDays(String(d))}
                className={cn(
                  "tabular h-8 cursor-pointer rounded-md border px-2.5 text-[13px] font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  days === String(d)
                    ? "border-ring/40 bg-accent font-semibold text-accent-foreground"
                    : "border-input bg-card text-foreground hover:bg-muted",
                )}
              >
                {pluralDays(d)}
              </button>
            ))}
            <Input
              id={`${id}-days`}
              type="number"
              inputMode="numeric"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              aria-invalid={daysInvalid || undefined}
              aria-label="Кількість днів"
              className="tabular h-8 w-20 md:h-8"
            />
          </div>
          <p
            className={cn(
              "text-xs",
              daysInvalid ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {daysInvalid
              ? "Від 1 до 365 днів"
              : until && `Обмеження діятиме до ${formatDate(until)}`}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-reason`} required>
          Причина
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REASONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setReason(q)}
              className={cn(
                "h-7 cursor-pointer rounded-md border px-2 text-xs font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                reason.trim() === q
                  ? "border-ring/40 bg-accent text-accent-foreground"
                  : "border-input bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {q}
            </button>
          ))}
        </div>
        <Textarea
          id={`${id}-reason`}
          value={reason}
          maxLength={1000}
          onChange={(e) => setReason(e.target.value)}
          aria-invalid={reasonMissing || undefined}
          placeholder="Людина побачить причину в сповіщенні"
          className="min-h-24"
        />
        {reasonMissing && (
          <p className="text-xs text-destructive">Вкажіть причину</p>
        )}
      </div>

      {restrict.isError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-tint-red px-3.5 py-2.5 text-sm text-tint-red-ink"
        >
          {getErrorMessage(restrict.error, "Не вдалося застосувати обмеження.")}
        </p>
      )}

      <DialogFooter>
        <Button
          variant="outline"
          disabled={restrict.isPending}
          onClick={() => onOpenChange(false)}
        >
          Скасувати
        </Button>
        <Button
          variant="destructive"
          disabled={restrict.isPending}
          onClick={submit}
        >
          {restrict.isPending
            ? "Зачекайте…"
            : permanent
              ? "Заблокувати"
              : `Обмежити на ${daysValid ? pluralDays(daysNumber) : "…"}`}
        </Button>
      </DialogFooter>
    </>
  );
}
