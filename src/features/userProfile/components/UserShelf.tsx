import { Link } from "react-router-dom";
import { IconBook, IconChevronRight, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import type { ListingResponse } from "@/features/listings/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUserListings } from "../hooks/useUserProfile";
import SmartImage from "@/components/ui/SmartImage";

function ShelfBook({ listing }: { listing: ListingResponse }) {
  const [failed, setFailed] = useState(false);
  const status = STATUS_CONFIG[listing.status];

  return (
    <li>
      <Link
        to={`/listings/${listing.id}`}
        className="group flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative flex aspect-2/3 w-full items-center justify-center overflow-hidden rounded-lg bg-secondary shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:shadow-md">
          {listing.bookCoverUrl && !failed ? (
            <SmartImage
              src={listing.bookCoverUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover"
              onError={() => setFailed(true)}
            />
          ) : (
            <IconBook className="size-8 text-muted-foreground" stroke={1.5} />
          )}
          {listing.status !== "AVAILABLE" && (
            <span
              className={cn(
                "absolute inset-x-1.5 bottom-1.5 rounded-md px-1.5 py-0.5 text-center text-[11px] font-bold backdrop-blur",
                status.color,
                "bg-card/90",
              )}
            >
              {status.label}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm leading-snug font-bold group-hover:underline">
            {listing.bookTitle}
          </p>
          {listing.bookAuthor && (
            <p className="truncate text-xs text-muted-foreground">
              {listing.bookAuthor}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}

interface UserShelfProps {
  userId: string;
  isOwn?: boolean;
}

export default function UserShelf({ userId, isOwn = false }: UserShelfProps) {
  const {
    data,
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useUserListings(userId);

  const listings = data?.pages.flatMap((p) => p.content) ?? [];
  const total = data?.pages[0]?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-semibold md:text-[22px]">
          Книги на полиці
        </h2>
        <div className="flex items-baseline gap-3">
          {total > 0 && (
            <span className="text-sm font-semibold text-muted-foreground">
              {total}
            </span>
          )}
          {isOwn && total > 0 && (
            <Link
              to="/?tab=my"
              className="inline-flex items-center gap-0.5 text-sm font-bold text-accent-vivid hover:underline"
            >
              Керувати
              <IconChevronRight className="size-4" />
            </Link>
          )}
        </div>
      </div>

      {isPending ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Не вдалося завантажити книги.
          </p>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => refetch()}
          >
            Спробувати ще раз
          </Button>
        </div>
      ) : listings.length === 0 ? (
        isOwn ? (
          <div className="flex flex-col items-start gap-3 border-t border-border/70 pt-4">
            <p className="text-sm text-muted-foreground">
              Ваша полиця порожня. Додайте книгу — її побачать інші читачі в
              каталозі й у вашому профілі.
            </p>
            <Link
              to="/listings/create"
              className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              <IconPlus className="size-4" />
              Додати книгу
            </Link>
          </div>
        ) : (
          <p className="border-t border-border/70 pt-4 text-sm text-muted-foreground">
            Зараз на полиці немає книг.
          </p>
        )
      ) : (
        <>
          <ul className="stagger-in grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:gap-x-4">
            {listings.map((listing) => (
              <ShelfBook key={listing.id} listing={listing} />
            ))}
          </ul>
          {hasNextPage && (
            <Button
              variant="outline"
              className="h-10 cursor-pointer self-center rounded-[10px] px-5 font-semibold"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Завантаження..." : "Показати ще"}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
