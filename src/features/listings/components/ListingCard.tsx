import { Button } from "@/components/ui/button";
import type { ListingResponse, ListingStatus } from "../types";
import {
  IconArchive,
  IconBooks,
  IconCheck,
  IconClock,
  IconMapPin,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

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
  const status = statusConfig[listing.status];
  const isAvailable = listing.status === "AVAILABLE";
  return (
    <div className="bg-card w-full shadow-md rounded-xl p-4 flex flex-col border border-border gap-3">
      <div className="w-full relative flex flex-col gap-4">
        <img
          className="h-90 w-full rounded-2xl shadow-sm"
          src={listing.bookCoverUrl ?? ""}
          alt={listing.bookTitle}
        />
        <p className="absolute top-0 right-0 text-xs bg-muted-foreground py-0.5 px-1.5 rounded-md flex items-center justify-center text-muted font-light shadow-md">
          {formatDaysAgo(listing.createdAt)}
        </p>
        <p className="bg-accent-vivid text-muted py-1 px-4 rounded-md w-fit text-xs font-bold">
          {listing.bookGenre ?? "Жанр невідомий"}
        </p>
      </div>
      <div>
        <h2 className="text-foreground font-bold text-lg">
          {listing.bookTitle}
        </h2>
        <p className="text-foreground font-light text-xs">
          {listing.bookAuthor ?? "Автор невідомий"}
        </p>
      </div>
      <div className="flex flex-col gap-4">
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
              {listing.ownerCity ?? "Місто не вказано"}
            </span>
          </div>
        </div>
        <Button
          disabled={!isAvailable}
          className="text-sm font-normal cursor-pointer"
        >
          {status.buttonLabel}
        </Button>
      </div>
    </div>
  );
}
