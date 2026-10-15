import { useRequestsFilters } from "../hooks/useRequestsFilters";
import { useRequestsList } from "../hooks/useRequestsList";
import SentRequestCard from "./SentRequestCard";

export default function SentRequestsList() {
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
  if (isFetching) {
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
  if (!data || data.totalElements === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Поки що немає надісланих заявок
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      {data.items.map((req) => (
        <SentRequestCard key={req.id} request={req} />
      ))}
    </div>
  );
}
