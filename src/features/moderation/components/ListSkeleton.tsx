import { Skeleton } from "@/components/ui/skeleton";

/** Заглушка рядків списку панелі модерації */
export default function ListSkeleton({
  rows = 4,
  cover = false,
}: {
  rows?: number;
  cover?: boolean;
}) {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface flex gap-4 p-4">
          {cover ? (
            <Skeleton className="h-[104px] w-[72px] shrink-0 rounded-md" />
          ) : (
            <Skeleton className="size-10 shrink-0 rounded-full" />
          )}
          <div className="flex flex-1 flex-col gap-2.5 pt-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3.5 w-1/3" />
            {cover && <Skeleton className="h-3.5 w-4/5" />}
          </div>
        </div>
      ))}
    </div>
  );
}
