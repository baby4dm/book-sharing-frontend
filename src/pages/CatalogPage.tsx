import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import ListingCard from "@/features/listings/components/ListingCard";
import ListingFilterPanel from "@/features/listings/components/ListingFilterPanel";
import { useListings } from "@/features/listings/hooks/useListings";
import type { ListingFilters } from "@/features/listings/types";
import { useState } from "react";

export default function CatalogPage() {
  const [filters, setFilters] = useState<ListingFilters>({
    sort: "createdAt,desc",
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useListings(filters);
  const allListings = data?.pages.flatMap((page) => page.content) ?? [];
  function updateFilters(filters: ListingFilters) {
    setFilters((prev) => ({ ...prev, ...filters }));
  }

  return (
    <section className="w-full px-4 py-6 md:px-2 lg:px-12 xl:px-16 2xl:px-20 flex flex-col gap-4">
      <ListingFilterPanel filters={filters} onUpdateFilters={updateFilters} />
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-8 3xl:grid-cols-5  4xl:grid-cols-6
      gap-4 max-w-175 md:max-w-300 lg:max-w-350 xl:max-w-400 2xl:max-w-600 3xl:max-w-[1900px] mx-auto"
      >
        {allListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
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
    </section>
  );
}
