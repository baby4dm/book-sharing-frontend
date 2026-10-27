import { dropdownMotion } from "@/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const MENU_WIDTH = 240;
const EDGE_GAP = 8;

interface Option<T extends string> {
  value: T;
  label: string;
}

interface FilterDropdownProps<T extends string> {
  icon: ReactNode;
  triggerLabel: string;
  heading?: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  isActive?: boolean;
  align?: "left" | "right";
}

const FilterDropdown = <T extends string>({
  icon,
  triggerLabel,
  heading,
  options,
  value,
  onChange,
  isActive = false,
  align = "right",
}: FilterDropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"left" | "right">(align);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const fitsRight = rect.right - MENU_WIDTH >= EDGE_GAP;
      const fitsLeft = rect.left + MENU_WIDTH <= window.innerWidth - EDGE_GAP;

      if (align === "right") {
        setPlacement(fitsRight || !fitsLeft ? "right" : "left");
      } else {
        setPlacement(fitsLeft || !fitsRight ? "left" : "right");
      }
    }
    setOpen((prev) => !prev);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium shadow-xs transition-[border-color,box-shadow,color] duration-150 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 md:h-9 [&>svg]:shrink-0",
          open
            ? "border-ring ring-3 ring-ring/15"
            : "border-input hover:border-border-strong",
          isActive ? "text-accent-foreground" : "text-foreground",
        )}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate text-left whitespace-nowrap">
          {triggerLabel}
        </span>
        <IconChevronDown
          size={16}
          className={cn(
            "text-muted-foreground transition-[rotate] duration-200 ease-out",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...dropdownMotion}
            style={{ transformOrigin: "top right" }}
            role="listbox"
            className={cn(
              "absolute top-full z-20 mt-2 w-60 max-w-[calc(100vw-1rem)] rounded-xl bg-popover p-1.5 shadow-pop",
              placement === "right" ? "right-0" : "left-0",
            )}
          >
            {heading && (
              <p className="px-2.5 pb-1 pt-1.5 field-label">{heading}</p>
            )}

            {options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {option.label}
                  {selected && <IconCheck size={16} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;
