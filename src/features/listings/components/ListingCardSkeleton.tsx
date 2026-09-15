export function ListingCardSkeleton() {
  return (
    <div className="bg-card shadow-md rounded-xl  p-4 flex flex-col border border-border gap-3 w-74 lg:w-81.25 mx-auto">
      <div className="w-full relative flex flex-col gap-4">
        <div className="h-90 w-full rounded-2xl bg-border shimmer" />
        <div className="w-20 h-6 rounded-md bg-border shimmer" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="w-3/4 h-5 rounded bg-border shimmer" />
        <div className="w-1/2 h-3 rounded bg-border shimmer" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="w-16 h-4 rounded bg-border shimmer" />
          <div className="w-24 h-4 rounded bg-border shimmer" />
        </div>
        <div className="w-full h-9 rounded-md bg-border shimmer" />
      </div>
    </div>
  );
}
