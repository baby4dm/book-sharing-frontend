import { AnimatePresence, motion } from "motion/react";
import { listItemMotion } from "@/lib/motion";
import EmptyState from "@/components/ui/empty-state";
import BookRowSkeleton from "@/components/layout/BookRowSkeleton";
import {
  IconAlertTriangle,
  IconFilterOff,
  IconSend,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
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
        <BookRowSkeleton />
      ) : isError ? (
        <EmptyState
          framed
          className="w-full max-w-220"
          icon={IconAlertTriangle}
          title="Не вдалося завантажити заявки"
          description="Перевірте з'єднання і спробуйте ще раз."
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={reset}>
                Скинути фільтри
              </Button>
            ) : undefined
          }
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          framed
          className="w-full max-w-220"
          icon={hasActiveFilters ? IconFilterOff : IconSend}
          title={
            hasActiveFilters
              ? "За цими умовами нічого немає"
              : "Ви ще не надсилали заявок"
          }
          description={
            hasActiveFilters
              ? "Спробуйте інший статус чи спосіб доставки або скиньте фільтри."
              : "Знайдіть книгу в каталозі й попросіть її почитати."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={reset}>
                Скинути фільтри
              </Button>
            ) : (
              <Button nativeButton={false} render={<Link to="/" />}>
                Перейти до каталогу
              </Button>
            )
          }
        />
      ) : (
        <>
          <div
            aria-busy={isPlaceholderData}
            className={cn(
              "flex w-full flex-col items-center gap-3 transition-opacity duration-200",
              isPlaceholderData && "pointer-events-none opacity-60",
            )}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {data.items.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  {...listItemMotion}
                  className="flex w-full justify-center"
                >
                  <SentRequestCard request={req} />
                </motion.div>
              ))}
            </AnimatePresence>
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
