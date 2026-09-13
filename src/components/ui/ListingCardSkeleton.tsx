export function ListingCardSkeleton() {
  return (
    <div className="border border-border rounded-xl p-4 flex flex-col gap-2.5 animate-pulse">
      <div className="w-full aspect-2/3 rounded-lg bg-secondary" />
      <div className="w-16 h-3 rounded bg-secondary" />
      <div className="w-3/4 h-4 rounded bg-secondary" />
      <div className="w-1/2 h-3 rounded bg-secondary" />
      <div className="w-full h-8 rounded-lg bg-secondary" />
    </div>
  );
}
