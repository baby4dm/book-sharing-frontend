import { useEffect } from "react";
import { useRequestsFilters } from "../hooks/useRequestsFilters";
import { useRequestsList } from "../hooks/useRequestsList";
import ReceivedRequestCard from "./ReceivedRequestCard";
import { Button } from "@/components/ui/button";
import Pagination from "./Pagination";

export default function ReceivedRequestsList() {
  const {
    filters,
    searchInput,
    setSearchInput,
    updateFilters,
    reset,
    hasActiveFilters,
  } = useRequestsFilters();
  const { data, isPending, isError, isFetching, isPlaceholderData } =
    useRequestsList("sent", filters);

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

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Завантаження...
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        Не вдалось завантажити заявки
      </p>
    );
  }
  if (data && data.items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          {hasActiveFilters
            ? "За цими умовами нічого не знайдено"
            : "Ви ще не надсилали заявок"}
        </p>
        {hasActiveFilters && (
          <Button type="button" onClick={reset}>
            Скинути фільтри
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      {data.items.map((req) => (
        <ReceivedRequestCard key={req.id} request={req} />
      ))}

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onChange={(page) => updateFilters({ page })}
      />
    </div>
  );
}
