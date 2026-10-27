import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Завантаження профілю"
      className="mx-auto flex w-full max-w-295 flex-col items-start gap-4 px-4 pt-6 pb-20 md:gap-6 md:px-8 lg:flex-row lg:px-12 lg:pt-8"
    >
      <div className="surface flex w-full flex-col items-center gap-4 p-6 lg:w-85 lg:shrink-0">
        <Skeleton className="size-24 rounded-full md:size-28" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>
      <div className="flex w-full min-w-0 flex-1 flex-col gap-4 md:gap-6">
        <div className="surface grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="surface flex flex-col gap-4 p-5 md:p-6">
          <Skeleton className="h-5 w-36" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-2/3 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
