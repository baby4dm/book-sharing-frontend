import { SETTLEMENT_TYPE_LABELS, type ListingResponse } from "../types";
import { IconBook, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn, formatDaysAgo } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import RequestFormDialog from "../../requests/components/RequestFormDialog";
import SmartImage from "@/components/ui/SmartImage";

interface ListingCardProps {
  listing: ListingResponse;
  owner?: boolean;
}

export default function ListingCard({ listing, owner }: ListingCardProps) {
  const [imageIsFailed, setImageIsFailed] = useState(false);
  const [requestDialogIsOpen, setRequestDialogIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const status = STATUS_CONFIG[listing.status];
  const isAvailable = listing.status === "AVAILABLE";

  const place = listing.settlementName
    ? `${SETTLEMENT_TYPE_LABELS[listing.settlementType].substring(0, 1).toLowerCase()}. ${listing.settlementName}`
    : null;
  const meta = [listing.bookGenre, place, formatDaysAgo(listing.createdAt)]
    .filter(Boolean)
    .join(" · ");

  function handleRequest() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setRequestDialogIsOpen(true);
  }

  return (
    <article
      className="group surface surface-interactive relative flex flex-col gap-3 p-2 sm:p-2.5
        has-[a:active]:scale-[0.99] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring"
    >
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-muted shadow-[inset_0_0_0_1px_var(--border)]">
        {imageIsFailed || !listing.bookCoverUrl ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <IconBook
              size={32}
              stroke={1.5}
              className="text-muted-foreground"
            />
          </div>
        ) : (
          <SmartImage
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            src={listing.bookCoverUrl}
            alt=""
            onError={() => setImageIsFailed(true)}
          />
        )}
        {listing.hiddenAt ? (
          // власник бачить свої приховані модератором оголошення у «Моїх»
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-tint-red px-2.5 py-1 text-xs font-semibold text-tint-red-ink">
            <IconEyeOff className="size-3.5" />
            Приховано
          </span>
        ) : (
          !isAvailable && (
            <span
              className={cn(
                "absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold",
                status.bg,
                status.color,
              )}
            >
              {status.label}
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-1">
        <h2 className="book-title line-clamp-2 text-[15px] leading-snug sm:text-base">
          <Link
            to={`/listings/${listing.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-xl"
          >
            {listing.bookTitle}
          </Link>
        </h2>
        <p className="truncate text-[13px] text-muted-foreground">
          {listing.bookAuthor ?? "Автор невідомий"}
        </p>
        {meta && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {meta}
          </p>
        )}
      </div>

      {!owner && isAvailable && !listing.hiddenAt && (
        <button
          type="button"
          onClick={handleRequest}
          className="relative z-10 mx-0.5 mb-0.5 h-8 cursor-pointer rounded-md border border-input bg-card px-3 text-[13px] font-semibold text-foreground shadow-xs
            transition-[background-color,border-color,color,scale] duration-150 ease-out
            hover:border-transparent hover:bg-primary hover:text-primary-foreground active:scale-[0.97]
            outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {status.buttonLabel}
        </button>
      )}

      {requestDialogIsOpen && (
        <RequestFormDialog
          listing={listing}
          open={requestDialogIsOpen}
          onOpenChange={setRequestDialogIsOpen}
        />
      )}
    </article>
  );
}
