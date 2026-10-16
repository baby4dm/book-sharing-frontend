import { cn } from "@/lib/utils";
import type { ExchangeStatus } from "../types";

const CHIPS: { value: ExchangeStatus | null; label: string }[] = [
  { value: null, label: "Усі" },
  { value: "HANDOVER_PENDING", label: "Очікують передачі" },
  { value: "IN_READING", label: "У читанні" },
  { value: "RETURN_PENDING", label: "Повернення" },
  { value: "OVERDUE", label: "Прострочені" },
  { value: "DISPUTED", label: "Спір" },
  { value: "COMPLETED", label: "Завершені" },
];

interface ExchangesStatusChipsProps {
  value: ExchangeStatus | null;
  counts: Record<ExchangeStatus, number> | undefined;
  total: number | undefined;
  onChange: (status: ExchangeStatus | null) => void;
}

const ExchangesStatusChips = ({
  value,
  counts,
  total,
  onChange,
}: ExchangesStatusChipsProps) => (
  <div className="flex flex-wrap gap-2">
    {CHIPS.map((chip) => {
      const count = chip.value === null ? total : counts?.[chip.value];
      const selected = chip.value === value;

      return (
        <button
          key={chip.label}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(chip.value)}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            selected
              ? "border-accent-vivid bg-accent-vivid text-white"
              : "border-input bg-card hover:bg-muted",
            !selected && count === 0 && "text-muted-foreground",
          )}
        >
          {chip.label}
          {count !== undefined && (
            <span className="ml-1.5 opacity-70">· {count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default ExchangesStatusChips;
