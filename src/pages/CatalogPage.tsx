import { Button } from "@/components/ui/button";
import { ListingCardSkeleton } from "@/features/listings/components/ListingCardSkeleton";
import { Spinner } from "@/components/ui/Spinner";
import ListingCard from "@/features/listings/components/ListingCard";
import ListingFilterPanel from "@/features/listings/components/ListingFilterPanel";
import { useListings } from "@/features/listings/hooks/useListings";
import type { ListingFilters } from "@/features/listings/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUserListings } from "@/features/listings/hooks/useCurrentUserListing";

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
  function updateFilters(filters: ListingFilters) {
    setFilters((prev) => ({ ...prev, ...filters }));
  }
  if (isCatalogError || isError) {
    return (
      <section className="w-full px-4 py-16 flex flex-col items-center gap-3 text-center">
        <p className="text-foreground font-semibold">
          Не вдалось завантажити оголошення
        </p>
        <p className="text-sm text-muted-foreground">
          Перевірте з'єднання з інтернетом і спробуйте ще раз
        </p>
        <Button
          variant="outline"
          className="cursor-pointer mt-2"
          onClick={() => window.location.reload()}
        >
          Спробувати ще раз
        </Button>
      </section>
    );
  }
  return (
    <section className="w-full px-4 py-6 md:px-4 xl:px-16 2xl:px-20 flex flex-col gap-4 pb-30">
      <Tabs
        defaultValue="catalog"
        className="w-full flex flex-col gap-4 lg:gap-8"
      >
        <TabsList className="group-data-horizontal/tabs:h-12 p-1.5 max-w-120 w-full">
          <TabsTrigger className="cursor-pointer" value="catalog">
            Каталог
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="my">
            Мої оголошення
          </TabsTrigger>
        </TabsList>

        <ListingFilterPanel filters={filters} onUpdateFilters={updateFilters} />
        <TabsContent value="catalog">
          <div className="w-full flex flex-col gap-4 lg:gap-8">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-8 3xl:grid-cols-5  4xl:grid-cols-6
      gap-4 max-w-175 md:max-w-300 lg:max-w-350 xl:max-w-400 2xl:max-w-600 3xl:max-w-800 mx-auto"
            >
              {isCatalogLoading &&
                Array.from({ length: 16 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              {!isCatalogLoading &&
                allListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
            {hasNextCatalogPage && (
              <Button
                variant="outline"
                className="cursor-pointer w-full max-w-60 h-11 self-center mt-5"
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
          <div className="w-full flex flex-col gap-4 lg:gap-8">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-8 3xl:grid-cols-5  4xl:grid-cols-6
      gap-4 max-w-175 md:max-w-300 lg:max-w-350 xl:max-w-400 2xl:max-w-600 3xl:max-w-800 mx-auto"
            >
              {isLoading &&
                Array.from({ length: 16 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              {!isLoading &&
                myListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} owner />
                ))}
            </div>
            {hasNextPage && (
              <Button
                variant="outline"
                className="cursor-pointer w-full max-w-60 h-11 self-center mt-5"
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
