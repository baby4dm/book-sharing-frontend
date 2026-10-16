import { IconArrowsSort, IconBox } from "@tabler/icons-react";
import SearchInput from "@/features/listings/components/SearchInput";
import FilterDropdown from "@/features/requests/components/FilterDropdown";
import type {
  ExchangeFilterPatch,
  ExchangeFilters,
  ExchangeListResponse,
  ExchangeSort,
} from "../types";
import ExchangesStatusChips from "./ExchangeStatusChips";

const SORT_OPTIONS = [
  { value: "DEADLINE", label: "Найближчий дедлайн" },
  { value: "NEWEST", label: "Спочатку нові" },
  { value: "OLDEST", label: "Спочатку старі" },
] as const;

const DELIVERY_OPTIONS = [
  { value: "ALL", label: "Усі" },
  { value: "PICKUP", label: "Особиста зустріч" },
  { value: "MAIL", label: "Поштою" },
] as const;

interface ExchangesToolbarProps {
  filters: ExchangeFilters;
  onSearchInputChange: (value: string) => void;
  onFiltersChange: (patch: ExchangeFilterPatch) => void;
  data: ExchangeListResponse | undefined;
}

export default function ExchangesToolbar({
  filters,
  onSearchInputChange,
  onFiltersChange,
  data,
}: ExchangesToolbarProps) {
  const deliveryValue = filters.deliveryMethod ?? "ALL";
  const deliveryLabel =
    DELIVERY_OPTIONS.find(
      (o) => o.value === deliveryValue,
    )?.label.toLowerCase() ?? "усі";
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? "Сортування";

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-wrap items-center gap-2">
        <SearchInput
          placeholder="Назва книги або ім'я"
          handleChange={onSearchInputChange}
          className="min-w-90 flex-1"
        />
        <div className="flex items-center gap-2">
          <FilterDropdown
            icon={<IconBox size={16} />}
            triggerLabel={`Спосіб: ${deliveryLabel}`}
            options={DELIVERY_OPTIONS}
            value={deliveryValue}
            isActive={filters.deliveryMethod !== null}
            onChange={(v) =>
              onFiltersChange({ deliveryMethod: v === "ALL" ? null : v })
            }
          />
          <FilterDropdown<ExchangeSort>
            icon={<IconArrowsSort size={16} />}
            triggerLabel={sortLabel}
            heading="Сортування"
            options={SORT_OPTIONS}
            value={filters.sort}
            onChange={(v) => onFiltersChange({ sort: v })}
          />
        </div>
      </div>
      <ExchangesStatusChips
        value={filters.status}
        counts={data?.statusCounts}
        total={data?.total}
        onChange={(status) => onFiltersChange({ status })}
      />
    </div>
  );
}
