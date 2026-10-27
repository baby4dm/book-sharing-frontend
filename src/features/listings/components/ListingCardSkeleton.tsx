import { Skeleton } from "@/components/ui/skeleton";

export function ListingCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="surface flex flex-col gap-3 p-2 sm:p-2.5"
    >
      <Skeleton className="aspect-2/3 w-full rounded-lg" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="mx-0.5 mb-0.5 h-8 rounded-md" />
    </div>
  );
}
