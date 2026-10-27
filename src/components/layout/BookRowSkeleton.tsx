import { Skeleton } from "@/components/ui/skeleton";

export default function BookRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Завантаження"
      className="flex w-full flex-col items-center gap-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="surface flex w-full max-w-220 flex-col gap-4 p-4 sm:flex-row md:gap-5 md:p-5"
        >
          <Skeleton className="h-40 w-full rounded-lg sm:h-26 sm:w-18" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
