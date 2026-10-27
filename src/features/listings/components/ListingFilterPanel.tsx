import { Button } from "@/components/ui/button";
import type { ListingFilters } from "../types";
import SearchInput from "./SearchInput";
import {
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import MultiSelectCheckList from "@/components/ui/MultiSelectCheckList";
import { GENRES } from "@/lib/constants";
import { useCities } from "../hooks/useCities";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "motion/react";
import { EASE_OUT, collapseMotion, springSheet } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

interface ListingFilterPanelProps {
  filters: ListingFilters;
  onUpdateFilters: (filters: ListingFilters) => void;
}

const defaultFilterValues = {
  status: undefined,
  deliveryMethod: undefined,
  genre: [],
  city: [],
};

export default function ListingFilterPanel({
  filters,
  onUpdateFilters,
}: ListingFilterPanelProps) {
  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<ListingFilters>({});
  const isMobile = useMediaQuery("(max-width: 767px)");
  const dragControls = useDragControls();
  const [panelSettled, setPanelSettled] = useState(false);
  const { data } = useCities();

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    document.body.style.overflow = filterIsOpen && isMobile ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [filterIsOpen]);

  const activeCount =
    (filters.status ? 1 : 0) +
    (filters.deliveryMethod ? 1 : 0) +
    (filters.genre?.length ?? 0) +
    (filters.city?.length ?? 0);

  function toggleSingleFilterValue<K extends keyof ListingFilters>(
    key: K,
    value: ListingFilters[K],
  ) {
    setTempFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  }

  function setArrayFilter<K extends "genre" | "city">(
    key: K,
    values: string[],
  ) {
    setTempFilters((prev) => ({ ...prev, [key]: values }));
  }

  return (
    <div className="w-full">
      <div className="flex gap-2 items-center w-full">
        <SearchInput
          placeholder="Назва книги або автор"
          handleChange={(value) => onUpdateFilters({ search: value })}
          className="flex-2 min-w-50"
        />

        <Button
          variant="outline"
          aria-label={
            filters.sort === "createdAt,desc"
              ? "Сортування: спочатку нові"
              : "Сортування: спочатку старі"
          }
          className="h-10 shrink-0 gap-1.5 md:h-9"
          onClick={() =>
            onUpdateFilters(
              filters.sort === "createdAt,desc"
                ? { sort: "createdAt,asc" }
                : { sort: "createdAt,desc" },
            )
          }
        >
          {filters.sort === "createdAt,desc" ? (
            <>
              <IconSortDescending size={16} />
              <span className="hidden lg:inline">Спочатку нові</span>
            </>
          ) : (
            <>
              <IconSortAscending size={16} />
              <span className="hidden lg:inline">Спочатку старі</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          aria-expanded={filterIsOpen}
          aria-label="Фільтри"
          className="h-10 shrink-0 gap-1.5 md:h-9"
          onClick={() => setFilterIsOpen((prev) => !prev)}
        >
          <IconFilter size={16} />
          <span className="hidden md:inline">Фільтри</span>
          {activeCount > 0 && (
            <span className="tabular flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {filterIsOpen && isMobile && (
          <motion.div
            key="filter-backdrop"
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-[oklch(0.21_0.01_158/0.32)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            onClick={() => setFilterIsOpen(false)}
          />
        )}
        {filterIsOpen && (
          <motion.div
            key="filter-panel"
            role={isMobile ? "dialog" : undefined}
            aria-modal={isMobile ? true : undefined}
            aria-label="Фільтри"
            {...(isMobile
              ? {
                  initial: { transform: "translateY(100%)" },
                  animate: {
                    transform: "translateY(0%)",
                    transition: springSheet,
                  },
                  exit: {
                    transform: "translateY(100%)",
                    transition: { duration: 0.22, ease: EASE_OUT },
                  },
                  drag: "y" as const,
                  dragListener: false,
                  dragControls,
                  dragConstraints: { top: 0, bottom: 0 },
                  dragElastic: { top: 0, bottom: 0.7 },
                  onDragEnd: (_: unknown, info: PanInfo) => {
                    if (info.offset.y > 90 || info.velocity.y > 450) {
                      setFilterIsOpen(false);
                    }
                  },
                }
              : {
                  ...collapseMotion,
                  style: { overflow: panelSettled ? "visible" : "hidden" },
                  onAnimationStart: () => setPanelSettled(false),
                  onAnimationComplete: () => setPanelSettled(true),
                })}
            className={
              isMobile
                ? "fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-xl border-t border-border bg-card px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-pop"
                : undefined
            }
          >
            <div className={isMobile ? "" : "surface mt-3 p-5 lg:p-6"}>
              {isMobile && (
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  className="-mx-5 flex cursor-grab touch-none justify-center pt-2.5 pb-3 active:cursor-grabbing"
                >
                  <div className="h-1 w-9 rounded-full bg-border-strong" />
                </div>
              )}

              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title">Фільтри</h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Закрити фільтри"
                  onClick={() => setFilterIsOpen((prev) => !prev)}
                >
                  <IconX size={18} />
                </Button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <Label className="field-label">Спосіб доставки</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className={`bg-card flex-1 h-9 text-sm font-medium cursor-pointer ${
                          tempFilters.deliveryMethod === "PICKUP"
                            ? "border-ring/40 bg-accent text-accent-foreground hover:border-ring/50 hover:bg-accent"
                            : "text-muted-foreground"
                        }`}
                        onClick={() =>
                          toggleSingleFilterValue("deliveryMethod", "PICKUP")
                        }
                      >
                        Особисто
                      </Button>
                      <Button
                        variant="outline"
                        className={`bg-card flex-1 h-9 text-sm font-medium cursor-pointer ${
                          tempFilters.deliveryMethod === "MAIL"
                            ? "border-ring/40 bg-accent text-accent-foreground hover:border-ring/50 hover:bg-accent"
                            : "text-muted-foreground"
                        }`}
                        onClick={() =>
                          toggleSingleFilterValue("deliveryMethod", "MAIL")
                        }
                      >
                        Пошта
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="field-label">Статус</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className={`bg-card flex-1 h-9 text-sm font-medium cursor-pointer ${
                          tempFilters.status === "AVAILABLE"
                            ? "border-ring/40 bg-accent text-accent-foreground hover:border-ring/50 hover:bg-accent"
                            : "text-muted-foreground"
                        }`}
                        onClick={() =>
                          toggleSingleFilterValue("status", "AVAILABLE")
                        }
                      >
                        Доступна
                      </Button>
                      <Button
                        variant="outline"
                        className={`bg-card flex-1 h-9 text-sm font-medium cursor-pointer ${
                          tempFilters.status === "RESERVED"
                            ? "border-ring/40 bg-accent text-accent-foreground hover:border-ring/50 hover:bg-accent"
                            : "text-muted-foreground"
                        }`}
                        onClick={() =>
                          toggleSingleFilterValue("status", "RESERVED")
                        }
                      >
                        Зарезервована
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b pb-6 border-border">
                  <div className="flex flex-col gap-2">
                    <Label className="field-label">Жанр</Label>
                    <MultiSelectCheckList
                      options={GENRES}
                      placeholder="Вибрати жанр"
                      selected={tempFilters.genre || []}
                      onChange={(selected) => setArrayFilter("genre", selected)}
                      inline={isMobile}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="field-label">Населений пункт</Label>
                    <MultiSelectCheckList
                      options={data || []}
                      placeholder="Вибрати населений пункт"
                      selected={tempFilters.city || []}
                      onChange={(selected) => setArrayFilter("city", selected)}
                      inline={isMobile}
                    />
                  </div>
                </div>

                <div className="flex gap-2 lg:w-1/2 lg:self-end">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setFilterIsOpen(false);
                      setTempFilters(defaultFilterValues);
                      onUpdateFilters(defaultFilterValues);
                    }}
                  >
                    Скинути
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setFilterIsOpen(false);
                      onUpdateFilters(tempFilters);
                    }}
                  >
                    Застосувати
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
