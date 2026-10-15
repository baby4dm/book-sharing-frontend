import { cn } from "@/lib/utils";
import type { RequestStatus } from "../types";

const CHIPS: { value: RequestStatus | null; label: string }[] = [
  { value: null, label: "Усі" },
  { value: "PENDING", label: "Очікують" },
  { value: "ACTIVE", label: "Підтверджені" },
  { value: "REJECTED", label: "Відхилені" },
  { value: "CANCELLED", label: "Скасовані" },
];

interface RequestStatusChipsProps {
  value: RequestStatus | null;
  counts: Record<RequestStatus, number> | undefined;
  total: number | undefined;
  onChange: (status: RequestStatus | null) => void;
}

const RequestStatusChips = ({
  value,
  counts,
  total,
  onChange,
}: RequestStatusChipsProps) => (
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

export default RequestStatusChips;
