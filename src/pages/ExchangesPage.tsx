import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IconArrowsExchange } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
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
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }
  if (!profile) return null;

  const groups =
    data && filters.status === null
      ? groupExchanges(data.items, profile.id)
      : null;

  return (
    <section className="mx-auto flex w-full max-w-236 flex-col gap-6 px-4 pb-16 pt-6 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold md:text-4xl">
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
        <div className="flex justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-destructive">
            Не вдалось завантажити обміни
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
        <EmptyState hasActiveFilters={hasActiveFilters} onReset={reset} />
      ) : (
        <>
          <div
            aria-busy={isPlaceholderData}
            className={cn(
              "flex flex-col gap-7 transition-opacity",
              isPlaceholderData && "pointer-events-none opacity-60",
            )}
          >
            {groups ? (
              groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-3">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    {group.title} · {group.items.length}
                  </h2>
                  {group.items.map((exchange) => (
                    <ExchangeCard
                      key={exchange.id}
                      exchange={exchange}
                      currentUserId={profile.id}
                    />
                  ))}
                </section>
              ))
            ) : (
              <div className="flex flex-col gap-3">
                {data.items.map((exchange) => (
                  <ExchangeCard
                    key={exchange.id}
                    exchange={exchange}
                    currentUserId={profile.id}
                  />
                ))}
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

function EmptyState({
  hasActiveFilters,
  onReset,
}: {
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          За цими умовами обмінів не знайдено
        </p>
        <Button className="cursor-pointer" onClick={onReset}>
          Скинути фільтри
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-input px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent">
        <IconArrowsExchange size={26} className="text-accent-vivid" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-xl font-semibold">
          Поки що немає обмінів
        </p>
        <p className="text-sm text-muted-foreground">
          Знайдіть книгу в каталозі й подайте заявку — після підтвердження тут
          з'явиться обмін.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
      >
        До каталогу
      </Link>
    </div>
  );
}
