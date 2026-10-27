import { Link } from "react-router-dom";
import {
  IconAlertTriangle,
  IconBook,
  IconBooks,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
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
        <div className="relative flex aspect-2/3 w-full items-center justify-center overflow-hidden rounded-lg bg-muted shadow-[inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-raise">
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
                "absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                status.bg,
                status.color,
              )}
            >
              {status.label}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="book-title line-clamp-2 text-sm leading-snug group-hover:underline">
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
    <section className="flex flex-col gap-4 surface p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-title">Книги на полиці</h2>
        <div className="flex items-baseline gap-3">
          {total > 0 && (
            <span className="tabular text-[13px] font-medium text-muted-foreground">
              {total}
            </span>
          )}
          {isOwn && total > 0 && (
            <Link
              to="/?tab=my"
              className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary hover:underline"
            >
              Керувати
              <IconChevronRight className="size-4" />
            </Link>
          )}
        </div>
      </div>

      {isPending ? (
        <div
          aria-busy="true"
          className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:gap-x-4"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-2/3 rounded-lg" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          className="py-6"
          icon={IconAlertTriangle}
          title="Не вдалося завантажити книги"
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Спробувати ще раз
            </Button>
          }
        />
      ) : listings.length === 0 ? (
        isOwn ? (
          <EmptyState
            className="border-t border-border py-8"
            icon={IconBooks}
            title="Ваша полиця порожня"
            description="Додайте книгу — її побачать у каталозі й у вашому профілі."
            action={
              <Button
                nativeButton={false}
                render={<Link to="/listings/create" />}
              >
                <IconPlus />
                Додати книгу
              </Button>
            }
          />
        ) : (
          <EmptyState
            className="border-t border-border py-8"
            icon={IconBooks}
            title="На полиці зараз порожньо"
            description="Коли людина додасть книгу, вона з'явиться тут."
          />
        )
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:gap-x-4">
            {listings.map((listing) => (
              <ShelfBook key={listing.id} listing={listing} />
            ))}
          </ul>
          {hasNextPage && (
            <Button
              variant="outline"
              className="self-center"
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
