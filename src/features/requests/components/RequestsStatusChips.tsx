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
  <div className="flex flex-wrap gap-1.5">
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
            "inline-flex h-8 cursor-pointer items-center rounded-md border px-2.5 text-[13px] font-medium transition-[background-color,border-color,color,scale] duration-150 ease-out outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97]",
            selected
              ? "border-ring/40 bg-accent font-semibold text-accent-foreground"
              : "border-input bg-card text-foreground shadow-xs hover:border-border-strong hover:bg-muted",
            !selected && count === 0 && "text-muted-foreground",
          )}
        >
          {chip.label}
          {count !== undefined && (
            <span
              className={cn(
                "tabular ml-1.5",
                selected
                  ? "text-accent-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default RequestStatusChips;
