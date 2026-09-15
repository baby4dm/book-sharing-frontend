import { Button } from "@/components/ui/button";
import {
  SETTLEMENT_TYPE_LABELS,
  type ListingResponse,
  type ListingStatus,
} from "../types";
import {
  IconArchive,
  IconBook,
  IconBooks,
  IconCheck,
  IconClock,
  IconMapPin,
} from "@tabler/icons-react";
import { useState, type ComponentType } from "react";

interface ListingCardProps {
  listing: ListingResponse;
}

const statusConfig: Record<
  ListingStatus,
  {
    label: string;
    buttonLabel: string;
    color: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }
> = {
  AVAILABLE: {
    label: "Доступна",
    buttonLabel: "Подати заявку",
    color: "text-success",
    icon: IconCheck,
  },
  RESERVED: {
    label: "Зарезервована",
    buttonLabel: "Уже зарезервована",
    color: "text-warning",
    icon: IconClock,
  },
  IN_EXCHANGE: {
    label: "У читанні",
    buttonLabel: "Зараз у читача",
    color: "text-info",
    icon: IconBooks,
  },
  ARCHIVED: {
    label: "Архівовано",
    buttonLabel: "Знято з публікації",
    color: "text-muted-foreground",
    icon: IconArchive,
  },
};

function formatDaysAgo(createdAt: string): string {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "Сьогодні";
  if (days === 1) return "Вчора";
  return `${days} дні тому`;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [imageIsLoaded, setImageIsLoaded] = useState(false);
  const [imageIsFailed, setImageIsFailed] = useState(false);
  const status = statusConfig[listing.status];
  const isAvailable = listing.status === "AVAILABLE";
  return (
    <div className="bg-card shadow-md rounded-xl  p-4 flex flex-col border border-border gap-3 w-74 lg:w-81.25 mx-auto">
      <div className="w-full relative flex flex-col gap-4">
        <div className="relative h-90 w-full rounded-2xl overflow-hidden">
          {!imageIsLoaded && !imageIsFailed && (
            <div className="absolute inset-0 bg-border shimmer rounded-2xl" />
          )}

          {imageIsFailed || !listing.bookCoverUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-2xl">
              <IconBook size={32} className="text-muted-foreground" />
            </div>
          ) : (
            <img
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageIsLoaded ? "opacity-100" : "opacity-0"
              }`}
              src={listing.bookCoverUrl}
              alt={listing.bookTitle}
              onLoad={() => setImageIsLoaded(true)}
              onError={() => setImageIsFailed(true)}
            />
          )}
        </div>

        <p className="absolute top-0 right-0 text-xs bg-muted-foreground py-0.5 px-1.5 rounded-md flex items-center justify-center text-muted font-light shadow-md">
          {formatDaysAgo(listing.createdAt)}
        </p>
        <p className="bg-accent-vivid text-muted py-1 px-4 rounded-md w-fit text-xs font-bold">
          {listing.bookGenre ?? "Жанр невідомий"}
        </p>
      </div>
      <div>
        <h2 className="text-foreground font-bold text-lg leading-none">
          {listing.bookTitle}
        </h2>
        <p className="text-foreground font-light text-xs">
          {listing.bookAuthor ?? "Автор невідомий"}
        </p>
      </div>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex gap-2">
          <div className="flex gap-1 items-center">
            <status.icon className={`${status.color} w-5 h-5`} />
            <span className="text-xs text-muted-foreground">
              {status.label}
            </span>
          </div>
          <div className="flex gap-1 items-center">
            <IconMapPin className="w-5 h-5 text-accent-vivid" />
            <span className="text-xs text-muted-foreground">
              {!listing.settlementName
                ? "Місто не вказано"
                : `${SETTLEMENT_TYPE_LABELS[listing.settlementType].substring(0, 1).toLowerCase()}.${listing.settlementName}, ${listing.region}`}
            </span>
          </div>
        </div>
        <Button
          disabled={!isAvailable}
          className="text-sm font-normal cursor-pointer mt-auto"
        >
          {status.buttonLabel}
        </Button>
      </div>
    </div>
  );
}
