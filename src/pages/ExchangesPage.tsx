import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IconAlertTriangle, IconArrowsExchange, IconFilterOff } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { listItemMotion } from "@/lib/motion";
import EmptyState from "@/components/ui/empty-state";
import BookRowSkeleton from "@/components/layout/BookRowSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Pagination from "@/features/requests/components/Pagination";
import ExchangeCard from "@/features/exchanges/components/ExchangeCard";
import ExchangeRoleSwitch from "@/features/exchanges/components/ExchangeRoleSwitch";
import ExchangesToolbar from "@/features/exchanges/components/ExchangesToolbar";
import { useExchangesFilters } from "@/features/exchanges/hooks/useExchangesFilters";
import { useExchangesList } from "@/features/exchanges/hooks/useExchangesList";
import type { ExchangeResponse } from "@/features/exchanges/types";
import { getPendingAction } from "@/features/exchanges/utils/exchangeListItem";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";

interface ExchangeGroup {
  key: string;
  title: string;
  items: ExchangeResponse[];
}

function groupExchanges(
  items: ExchangeResponse[],
  userId: string,
): ExchangeGroup[] {
  const needAction: ExchangeResponse[] = [];
  const active: ExchangeResponse[] = [];
  const done: ExchangeResponse[] = [];

  for (const exchange of items) {
    if (exchange.status === "COMPLETED") done.push(exchange);
    else if (getPendingAction(exchange, userId)) needAction.push(exchange);
    else active.push(exchange);
  }

  return [
    { key: "need", title: "Потребують вашої дії", items: needAction },
    { key: "active", title: "Активні", items: active },
    { key: "done", title: "Завершені", items: done },
  ].filter((group) => group.items.length > 0);
}

export default function ExchangesPage() {
  const { data: profile, isLoading: isProfileLoading } =
    useCurrentUserProfile();
  const { filters, setSearchInput, updateFilters, reset, hasActiveFilters } =
    useExchangesFilters();
  const { data, isPending, isError, isPlaceholderData } =
    useExchangesList(filters);

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

  if (isProfileLoading) {
    return (
      <section className="mx-auto flex w-full max-w-236 flex-col gap-6 px-4 pt-6 pb-16 md:px-8 lg:pt-8">
        <Skeleton className="h-8 w-44" />
        <BookRowSkeleton />
      </section>
    );
  }
  if (!profile) return null;

  const groups =
    data && filters.status === null
      ? groupExchanges(data.items, profile.id)
      : null;

  return (
    <section className="mx-auto flex w-full max-w-236 flex-col gap-5 px-4 pt-6 pb-16 md:px-8 lg:gap-6 lg:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="page-title">
          Мої обміни
        </h1>
        <ExchangeRoleSwitch
          value={filters.role}
          onChange={(role) => updateFilters({ role })}
        />
      </div>

      <ExchangesToolbar
        filters={filters}
        onSearchInputChange={setSearchInput}
        onFiltersChange={updateFilters}
        data={data}
      />

      {isPending ? (
        <BookRowSkeleton />
      ) : isError ? (
        <EmptyState
          framed
          icon={IconAlertTriangle}
          title="Не вдалося завантажити обміни"
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
        <ExchangesEmpty hasActiveFilters={hasActiveFilters} onReset={reset} />
      ) : (
        <>
          <div
            aria-busy={isPlaceholderData}
            className={cn(
              "flex flex-col gap-8 transition-opacity duration-200",
              isPlaceholderData && "pointer-events-none opacity-60",
            )}
          >
            {groups ? (
              groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-3">
                  <h2 className="flex items-baseline gap-2 section-title">
                    {group.title}
                    <span className="tabular text-[13px] font-medium text-muted-foreground">
                      {group.items.length}
                    </span>
                  </h2>
                  <AnimatePresence initial={false} mode="popLayout">
                    {group.items.map((exchange) => (
                      <motion.div key={exchange.id} layout {...listItemMotion}>
                        <ExchangeCard
                          exchange={exchange}
                          currentUserId={profile.id}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </section>
              ))
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {data.items.map((exchange) => (
                    <motion.div key={exchange.id} layout {...listItemMotion}>
                      <ExchangeCard
                        exchange={exchange}
                        currentUserId={profile.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
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
    </section>
  );
}

function ExchangesEmpty({
  hasActiveFilters,
  onReset,
}: {
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  if (hasActiveFilters) {
    return (
      <EmptyState
        framed
        icon={IconFilterOff}
        title="За цими умовами обмінів немає"
        description="Спробуйте інший статус чи спосіб доставки або скиньте фільтри."
        action={
          <Button variant="outline" onClick={onReset}>
            Скинути фільтри
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      framed
      icon={IconArrowsExchange}
      title="Обмінів поки немає"
      description="Знайдіть книгу в каталозі й подайте заявку — після підтвердження тут з'явиться обмін."
      action={
        <Button nativeButton={false} render={<Link to="/" />}>
          Перейти до каталогу
        </Button>
      }
    />
  );
}
