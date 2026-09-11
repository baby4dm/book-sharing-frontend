import { Button } from "@base-ui/react/button";
import type { ListingResponse, ListingStatus } from "../types";

interface ListingCardProps {
  listing: ListingResponse;
  className: string;
}

const statusConfig: Record<ListingStatus, { label: string; dotColor: string }> =
  {
    AVAILABLE: { label: "Доступна", dotColor: "bg-succes" },
    RESERVED: { label: "У черзі", dotColor: "bg-warning" },
    IN_EXCHANGE: { label: "У читанні", dotColor: "bg-info" },
    ARCHIVED: { label: "Архівовано", dotColor: "bg-muted-foreground" },
  };

function formatDaysAgo(createdAt: string): string {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "Сьогодні";
  if (days === 1) return "Вчора";
  return `${days} дні тому`;
}

export default function ListingCard({ listing, className }: ListingCardProps) {
  const status = statusConfig[listing.status];
  const isAvailable = listing.status === "AVAILABLE";
  console.log(listing);
  return (
    <div className="bg-card w-full shadow-xl rounded-xl p-4 flex flex-col items-center border border-border">
      <div className="w-full relative flex flex-col items-center">
        <img
          className="h-70 w-full rounded-2xl md:h-80 lg:h-90"
          src={listing.bookCoverUrl ?? ""}
          alt={listing.bookTitle}
        />
        <p className="absolute top-0 right-0 text-xs bg-muted-foreground py-0.5 px-1.5 rounded-md flex items-center justify-center text-muted font-light shadow-md">
          {formatDaysAgo(listing.createdAt)}
        </p>
        <p>{listing.bookGenre ?? "Жанр невідомий"}</p>
      </div>
      <div>
        <h2>{listing.bookTitle}</h2>
        <p>{listing.bookAuthor ?? "Автор невідомий"}</p>
      </div>
      <div>
        <div>
          <span className={`${status.dotColor} h-2 w-2`} />
          <span>{status.label}</span>
        </div>
        <Button>Подати заявку</Button>
      </div>
    </div>
  );
}
