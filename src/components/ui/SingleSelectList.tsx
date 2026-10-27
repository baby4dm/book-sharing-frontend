import { dropdownMotion } from "@/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { IconCheck, IconChevronDown, IconSearch } from "@tabler/icons-react";

interface SingleSelectListProps {
  options: readonly string[];
  selected: string | null;
  onChange: (selected: string) => void;
  placeholder: string;
  search?: boolean;
}

export default function SingleSelectList({
  options,
  selected,
  onChange,
  placeholder,
  search = true,
}: SingleSelectListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const hasValue = selected !== null && selected.length > 0;
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function handleSelect(option: string) {
    onChange(option);
    setIsOpen(false);
    setSearchQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-card px-3 text-sm shadow-xs transition-[border-color,box-shadow] duration-150 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 md:h-9 ${
          isOpen
            ? "border-ring ring-3 ring-ring/15"
            : "border-input hover:border-border-strong"
        }`}
      >
        <span className={`truncate ${hasValue ? "" : "text-muted-foreground"}`}>
          {hasValue ? selected : placeholder}
        </span>
        <IconChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-[rotate] duration-200 ease-(--ease-out) ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...dropdownMotion}
            style={{ transformOrigin: "top center" }}
            className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl bg-popover shadow-pop"
          >
            {search && (
              <div className="flex items-center gap-2 border-b border-border px-3">
                <IconSearch
                  size={14}
                  className="shrink-0 text-muted-foreground"
                />
                <input
                  type="text"
                  autoFocus
                  placeholder="Пошук..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div
              role="listbox"
              className="max-h-52 overflow-y-auto p-2 flex flex-col gap-1"
            >
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Нічого не знайдено
                </p>
              )}
              {filteredOptions.map((option) => {
                const isSelected = selected === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-accent font-semibold text-accent-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected && <IconCheck size={16} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
