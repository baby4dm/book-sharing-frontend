import { useEffect, useId, useRef, useState } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { cn } from "cn";

interface MultiSelectCheckListProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

export default function MultiSelectCheckList({
  options,
  selected,
  onChange,
  placeholder,
}: MultiSelectCheckListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : selected.length <= 2
        ? selected.join(", ")
        : `${selected.slice(0, 2).join(", ")} +${selected.length - 2}`;

  function toggle(option: string) {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  }

  function close() {
    setIsOpen(false);
    setSearchQuery("");
  }

  // Закриття по кліку поза компонентом і по Escape
  useEffect(() => {
    if (!isOpen) return;

    function closeFromOutside() {
      setIsOpen(false);
      setSearchQuery("");
    }
    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) closeFromOutside();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeFromOutside();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    searchRef.current?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-card px-3 text-left text-sm transition-colors",
          "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isOpen
            ? "border-primary"
            : "border-input hover:border-muted-foreground/40",
        )}
      >
        <span
          className={cn(
            "truncate",
            selected.length === 0
              ? "text-muted-foreground"
              : "font-medium text-foreground",
          )}
        >
          {triggerLabel}
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          {selected.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {selected.length}
            </span>
          )}
          <IconChevronDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-clip rounded-xl border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="relative border-b border-border p-2">
            <IconSearch
              size={16}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук..."
              aria-label="Пошук варіантів"
              className="h-9 w-full rounded-md bg-background pl-9 pr-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Очистити пошук"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            className="max-h-56 overflow-y-auto p-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Нічого не знайдено
              </li>
            )}

            {filtered.map((option) => {
              const isChecked = selected.includes(option);
              return (
                <li key={option} role="option" aria-selected={isChecked}>
                  <label
                    className={cn(
                      "relative flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm transition-colors",
                      isChecked
                        ? "bg-accent font-semibold text-accent-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(option)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                        "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                        isChecked
                          ? "border-primary bg-primary"
                          : "border-input bg-card",
                      )}
                    >
                      {isChecked && (
                        <IconCheck
                          size={13}
                          stroke={3}
                          className="text-primary-foreground"
                        />
                      )}
                    </span>
                    <span className="truncate">{option}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          {selected.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Обрано: {selected.length}
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="cursor-pointer rounded px-1.5 py-1 text-xs font-semibold text-accent-vivid hover:underline"
              >
                Очистити
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
