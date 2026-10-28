import { Button } from "@/components/ui/button";
import { ListingCardSkeleton } from "@/features/listings/components/ListingCardSkeleton";
import { Spinner } from "@/components/ui/Spinner";
import ListingCard from "@/features/listings/components/ListingCard";
import ListingFilterPanel from "@/features/listings/components/ListingFilterPanel";
import { useListings } from "@/features/listings/hooks/useListings";
import type { ListingFilters } from "@/features/listings/types";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IconBooks,
  IconPlus,
  IconSearchOff,
  IconWifiOff,
} from "@tabler/icons-react";
import EmptyState from "@/components/ui/empty-state";

const gridClass =
  "stagger-in grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUserListings } from "@/features/listings/hooks/useCurrentUserListing";
import { useIsModerator } from "@/features/moderation/hooks/useModeration";

export default function CatalogPage() {
  const [filters, setFilters] = useState<ListingFilters>({
    sort: "createdAt,desc",
  });
  const {
    data: catalogData,
    fetchNextPage: fetchNextCatalogPage,
    hasNextPage: hasNextCatalogPage,
    isFetchingNextPage: isFetchingNextCatalogPage,
    isLoading: isCatalogLoading,
    isError: isCatalogError,
  } = useListings(filters);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useCurrentUserListings(filters);
  const allListings = catalogData?.pages.flatMap((page) => page.content) ?? [];
  const myListings = data?.pages.flatMap((page) => page.content) ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isModerator } = useIsModerator();
  const tab =
    !isModerator && searchParams.get("tab") === "my" ? "my" : "catalog";
  function updateFilters(filters: ListingFilters) {
    setFilters((prev) => ({ ...prev, ...filters }));
  }
  if (isCatalogError || isError) {
    return (
      <section className="mx-auto w-full max-w-360 px-4 py-10 md:px-8">
        <EmptyState
          framed
          icon={IconWifiOff}
          title="Не вдалося завантажити книги"
          description="Перевірте з'єднання з інтернетом і спробуйте ще раз."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Спробувати ще раз
            </Button>
          }
        />
      </section>
    );
  }
  return (
    <section className="mx-auto flex w-full max-w-360 flex-col gap-5 px-4 py-6 pb-16 md:px-8 lg:py-8">
      <Tabs
        value={tab}
        onValueChange={(value) =>
          setSearchParams(value === "my" ? { tab: "my" } : {}, {
            replace: true,
          })
        }
        className="flex w-full flex-col gap-5"
      >
        <div className="flex w-full flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="page-title">Каталог</h1>
            <p className="text-sm text-muted-foreground">
              {isModerator
                ? "Перегляд для модерації: відкрийте оголошення, щоб приховати його"
                : "Книги, якими діляться люди поруч і по всій Україні"}
            </p>
          </div>
          {!isModerator && (
            <div className="flex items-center gap-2">
              <TabsList>
                <TabsTrigger className="cursor-pointer" value="catalog">
                  Каталог
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="my">
                  Мої{" "}
                  <span className="tabular text-muted-foreground">
                    {myListings.length}
                  </span>
                </TabsTrigger>
              </TabsList>
              <Button
                aria-label="Додати книгу"
                className="h-9 px-2.5 sm:px-3.5"
                onClick={() => navigate("/listings/create")}
              >
                <IconPlus size={16} />
                <span className="hidden sm:inline">Додати книгу</span>
              </Button>
            </div>
          )}
        </div>

        <ListingFilterPanel filters={filters} onUpdateFilters={updateFilters} />
        <TabsContent value="catalog">
          <div className="flex w-full flex-col gap-6">
            <div className={gridClass}>
              {isCatalogLoading &&
                Array.from({ length: 12 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              {!isCatalogLoading &&
                allListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
            {!isCatalogLoading && allListings.length === 0 && (
              <EmptyState
                framed
                icon={IconSearchOff}
                title="Нічого не знайдено"
                description="Спробуйте іншу назву чи автора або приберіть частину фільтрів."
              />
            )}
            {hasNextCatalogPage && (
              <Button
                variant="outline"
                className="w-full max-w-60 self-center"
                onClick={() => fetchNextCatalogPage()}
              >
                {isFetchingNextCatalogPage ? (
                  <Spinner size={20} />
                ) : (
                  "Завантажити ще"
                )}
              </Button>
            )}
          </div>
        </TabsContent>
        <TabsContent value="my">
          <div className="flex w-full flex-col gap-6">
            <div className={gridClass}>
              {isLoading &&
                Array.from({ length: 12 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              {!isLoading &&
                myListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} owner />
                ))}
            </div>
            {!isLoading && myListings.length === 0 && (
              <EmptyState
                framed
                icon={IconBooks}
                title="Ваша полиця порожня"
                description="Додайте книгу, яку готові дати почитати, — її побачать у каталозі."
                action={
                  <Button onClick={() => navigate("/listings/create")}>
                    <IconPlus size={16} />
                    Додати книгу
                  </Button>
                }
              />
            )}
            {hasNextPage && (
              <Button
                variant="outline"
                className="w-full max-w-60 self-center"
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? <Spinner size={20} /> : "Завантажити ще"}
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
