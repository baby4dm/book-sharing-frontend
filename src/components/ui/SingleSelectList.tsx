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
        className={`flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-transparent px-3 text-sm transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent ${
          isOpen ? "border-accent-vivid ring-[3px] ring-accent" : "border-input"
        }`}
      >
        <span className={`truncate ${hasValue ? "" : "text-muted-foreground"}`}>
          {hasValue ? selected : placeholder}
        </span>
        <IconChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
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
                      ? "bg-accent font-semibold text-accent-vivid"
                      : "hover:bg-secondary"
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && <IconCheck size={16} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
