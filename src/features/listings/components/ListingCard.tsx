import { Button } from "@/components/ui/button";
import { SETTLEMENT_TYPE_LABELS, type ListingResponse } from "../types";
import { IconBook, IconMapPin } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { STATUS_CONFIG } from "@/lib/constants";
import { formatDaysAgo } from "@/lib/utils";
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
  const status = STATUS_CONFIG[listing.status];
  const isAvailable = listing.status === "AVAILABLE";
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setRequestDialogIsOpen(true);
  }
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group bg-card shadow-md rounded-xl cursor-pointer
      p-4 flex flex-col border border-border gap-3 w-74 lg:w-81.25 mx-auto
      transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl active:translate-y-0 active:scale-[0.99]"
    >
      <div className="w-full relative flex flex-col gap-4">
        <div className="relative h-90 w-full rounded-2xl overflow-hidden">
          {imageIsFailed || !listing.bookCoverUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-2xl">
              <IconBook size={32} className="text-muted-foreground" />
            </div>
          ) : (
            <SmartImage
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              src={listing.bookCoverUrl}
              alt={listing.bookTitle}
              onError={() => setImageIsFailed(true)}
            />
          )}
        </div>

        <p
          className="absolute top-2 right-2 text-xs bg-muted-foreground py-1 
        px-2 rounded-md flex items-center justify-center text-muted font-bold shadow-sm"
        >
          {formatDaysAgo(listing.createdAt)}
        </p>
        <p className="absolute top-2 left-2 bg-card text-foreground py-1 px-2 rounded-md w-fit text-xs font-bold shadow-sm">
          {listing.bookGenre ?? "Жанр невідомий"}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-foreground font-bold text-lg leading-none">
          {listing.bookTitle}
        </h2>
        <p className="text-foreground font-light text-xs">
          {listing.bookAuthor ?? "Автор невідомий"}
        </p>
      </div>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col gap-2">
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
        {!owner && (
          <Button
            disabled={!isAvailable}
            onClick={(e) => handleClick(e)}
            className="text-sm font-normal cursor-pointer mt-auto"
          >
            {status.buttonLabel}
          </Button>
        )}

        {requestDialogIsOpen && (
          <RequestFormDialog
            listing={listing}
            open={requestDialogIsOpen}
            onOpenChange={setRequestDialogIsOpen}
          />
        )}
      </div>
    </Link>
  );
}
