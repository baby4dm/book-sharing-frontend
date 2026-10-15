import { useEffect } from "react";
import { useRequestsFilters } from "../hooks/useRequestsFilters";
import { useRequestsList } from "../hooks/useRequestsList";
import SentRequestCard from "./SentRequestCard";
import { Button } from "@/components/ui/button";
import Pagination from "./Pagination";
import RequestsToolbar from "./RequestsToolbar";
import { cn } from "cn";

interface SentRequestsListProps {
  onCountChange: (count: number | undefined) => void;
}

export default function SentRequestsList({
  onCountChange,
}: SentRequestsListProps) {
  const {
    filters,
    searchInput,
    setSearchInput,
    updateFilters,
    reset,
    hasActiveFilters,
  } = useRequestsFilters();
  const { data, isPending, isError, isPlaceholderData } = useRequestsList(
    "sent",
    filters,
  );

  useEffect(() => {
    onCountChange(data?.totalElements);
  }, [data]);

  useEffect(() => {
    if (
      data &&
      !isPlaceholderData &&
      data.items.length === 0 &&
      filters.page > 0
    ) {
      updateFilters({ page: filters.page - 1 });
    }
  }, [data, isPlaceholderData, filters.page, updateFilters]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <RequestsToolbar
        scope="sent"
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={updateFilters}
        data={data}
      />

      {isPending ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Завантаження...
        </p>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-destructive">
            Не вдалось завантажити заявки
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={reset}
            >
              Скинути фільтри
            </Button>
          )}
        </div>
      ) : data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "За цими умовами нічого не знайдено"
              : "Ви ще не надсилали заявок"}
          </p>
          {hasActiveFilters && (
            <Button
              className="w-fit cursor-pointer"
              type="button"
              onClick={reset}
            >
              Скинути фільтри
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            aria-busy={isPlaceholderData}
            className={cn(
              "flex w-full flex-col items-center gap-4 transition-opacity",
              isPlaceholderData && "pointer-events-none opacity-60",
            )}
          >
            {data.items.map((req) => (
              <SentRequestCard key={req.id} request={req} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onChange={(page) => updateFilters({ page })}
            />
          )}
        </>
      )}
    </div>
  );
}
