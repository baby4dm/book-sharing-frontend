import ListingCard from "@/features/listings/components/ListingCard";
import { useListings } from "@/features/listings/hooks/useListings";

export default function CatalogPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useListings({});
  const allListings = data?.pages.flatMap((page) => page.content) ?? [];
  return (
    <section className="w-full px-8 py-6 md:px-10">
      <ul className="w-full grid justify-center gap-6 grid-cols-[repeat(auto-fit,minmax(300px,0.45fr))] md:grid-cols-[repeat(auto-fit,minmax(300px,0.2fr))]">
        {allListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </ul>
    </section>
  );
}
