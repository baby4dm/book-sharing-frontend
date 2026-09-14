import { Button } from "@/components/ui/button";
import type { ListingFilters } from "../types";
import SearchInput from "./SearchInput";
import {
  IconFilter,
  IconPlus,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import MultiSelectCheckList from "@/components/ui/MultiSelectCheckList";
import { GENRES } from "@/lib/constants";
import { useCities } from "../hooks/useCities";

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
  const { data } = useCities();

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    document.body.style.overflow = filterIsOpen && isMobile ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [filterIsOpen]);

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
    <div className="w-full max-w-500 self-center">
      <div className="flex gap-2 items-center w-full">
        <SearchInput
          handleChange={(value) => onUpdateFilters({ search: value })}
        />

        <Button
          variant="outline"
          className="cursor-pointer h-10 shrink-0 gap-1.5 text-sm text-muted-foreground"
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
          className="cursor-pointer h-10 w-10 shrink-0"
          onClick={() => setFilterIsOpen((prev) => !prev)}
        >
          <IconFilter size={16} className="text-muted-foreground" />
        </Button>

        <Button className="hidden md:flex gap-2 items-center cursor-pointer h-10 px-6 shrink-0">
          <IconPlus size={16} />
          <span>Додати</span>
        </Button>

        <Button className="md:hidden fixed rounded-full w-12 h-12 bottom-4 right-4 z-10 shadow-lg">
          <IconPlus size={20} />
        </Button>
      </div>

      {filterIsOpen && (
        <div
          className="bg-card fixed z-20 w-full left-0 bottom-0 rounded-t-2xl border p-5
                     md:static md:z-0 md:mt-4 md:w-full md:rounded-xl md:border md:shadow-sm md:p-6"
        >
          <div className="h-1 w-10 bg-border rounded-full mx-auto mb-4 md:hidden" />

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-foreground">Фільтри</h2>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-8 w-8"
              onClick={() => setFilterIsOpen((prev) => !prev)}
            >
              <IconX size={18} />
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Спосіб доставки
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                      tempFilters.deliveryMethod === "PICKUP"
                        ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
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
                    className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                      tempFilters.deliveryMethod === "MAIL"
                        ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
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
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Статус
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                      tempFilters.status === "AVAILABLE"
                        ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
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
                    className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                      tempFilters.status === "RESERVED"
                        ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Жанр
                </Label>
                <MultiSelectCheckList
                  options={GENRES}
                  placeholder="Вибрати жанр"
                  selected={tempFilters.genre || []}
                  onChange={(selected) => setArrayFilter("genre", selected)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Населений пункт
                </Label>
                <MultiSelectCheckList
                  options={data || []}
                  placeholder="Вибрати населений пункт"
                  selected={tempFilters.city || []}
                  onChange={(selected) => setArrayFilter("city", selected)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1 border-t border-border md:border-t-0">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setFilterIsOpen(false);
                  setTempFilters(defaultFilterValues);
                  onUpdateFilters(defaultFilterValues);
                }}
              >
                Скинути
              </Button>
              <Button
                className="flex-1 cursor-pointer"
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
      )}
    </div>
  );
}
