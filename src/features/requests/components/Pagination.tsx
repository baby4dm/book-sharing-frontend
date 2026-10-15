import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const getPageItems = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const items: (number | "…")[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);

  if (start > 1) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 2) items.push("…");
  items.push(total - 1);
  return items;
};

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buttonClass =
    "flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="Сторінки"
      className="flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        aria-label="Попередня сторінка"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className={cn(
          buttonClass,
          "border-input bg-card hover:bg-muted disabled:opacity-40 disabled:hover:bg-card",
        )}
      >
        <IconChevronLeft size={16} />
      </button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(
              buttonClass,
              item === page
                ? "border-foreground bg-foreground text-background"
                : "border-input bg-card hover:bg-muted",
            )}
          >
            {item + 1}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Наступна сторінка"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className={cn(
          buttonClass,
          "border-input bg-card hover:bg-muted disabled:opacity-40 disabled:hover:bg-card",
        )}
      >
        <IconChevronRight size={16} />
      </button>
    </nav>
  );
}

export default Pagination;
