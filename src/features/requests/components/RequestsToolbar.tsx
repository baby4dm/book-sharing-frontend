import SearchInput from "@/features/listings/components/SearchInput";
import type {
  RequestScope,
  RequestFilters,
  RequestFilterPatch,
  RequestListResponse,
  RequestSort,
} from "../types";
import { IconBox, IconArrowsSort } from "@tabler/icons-react";
import FilterDropdown from "./FilterDropdown";
import RequestStatusChips from "./RequestsStatusChips";

const SORT_OPTIONS = [
  { value: "NEWEST", label: "Спочатку нові" },
  { value: "OLDEST", label: "Спочатку старі" },
  { value: "DEADLINE", label: "Найближча дата повернення" },
  { value: "RATING", label: "Найвищий рейтинг читача" },
] as const;

const DELIVERY_OPTIONS = [
  { value: "ALL", label: "Усі" },
  { value: "PICKUP", label: "Особиста зустріч" },
  { value: "MAIL", label: "Поштою" },
] as const;

interface RequestsToolbarProps {
  scope: RequestScope;
  filters: RequestFilters;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onFiltersChange: (patch: RequestFilterPatch) => void;
  data: RequestListResponse | undefined;
}

export default function RequestsToolbar({
  scope,
  filters,
  onSearchInputChange,
  onFiltersChange,
  data,
}: RequestsToolbarProps) {
  const sortOptions =
    scope === "received"
      ? SORT_OPTIONS
      : SORT_OPTIONS.filter((opt) => opt.value !== "RATING");
  const deliveryValue = filters.deliveryMethod ?? "ALL";
  const deliveryLabel =
    DELIVERY_OPTIONS.find(
      (o) => o.value === deliveryValue,
    )?.label.toLowerCase() ?? "УСІ";
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? "Сортування";

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full flex items-center gap-2 flex-wrap">
        <SearchInput
          placeholder="Назва книги або ім'я читача"
          handleChange={onSearchInputChange}
          className="flex-1 min-w-90"
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

          <FilterDropdown<RequestSort>
            icon={<IconArrowsSort size={16} />}
            triggerLabel={sortLabel}
            heading="Сортування"
            options={sortOptions}
            value={filters.sort}
            onChange={(v) => onFiltersChange({ sort: v })}
          />
        </div>
      </div>
      <RequestStatusChips
        value={filters.status}
        counts={data?.statusCounts}
        total={data?.total}
        onChange={(status) => onFiltersChange({ status })}
      />
    </div>
  );
}
