import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import QueryErrorState from "@/components/errors/QueryErrorState";
import { useAuth } from "@/context/AuthContext";
import { useListing } from "@/features/listings/hooks/useListing";
import { SETTLEMENT_TYPE_LABELS } from "@/features/listings/types";
import RequestFormDialog from "@/features/requests/components/RequestFormDialog";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { useUserProfile } from "@/features/userProfile/hooks/useUserProfile";
import UserLink from "@/features/userProfile/components/UserLink";
import {
  formatMemberSince,
  pluralizeExchanges,
} from "@/features/userProfile/utils/profileFormat";
import { DELIVERY_METHODS, STATUS_CONFIG } from "@/lib/constants";
import { formatDaysAgo } from "@/lib/utils";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBox,
  IconCheck,
  IconClock,
  IconMapPin,
  IconChevronRight,
  IconStarFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { findMyActiveRequest } from "@/api/listingQueue";
import ListingRequestQueue from "@/features/listings/components/ListingRequestQueue";
import { useListingRequests } from "@/features/listings/hooks/useListingRequests";
import SmartImage from "@/components/ui/SmartImage";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [requestDialogIsOpen, setRequestDialogIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: listing, isLoading, error, refetch } = useListing(id!);
  const { data: owner } = useUserProfile(listing?.ownerId);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const { data: user } = useCurrentUserProfile();
  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsError,
  } = useListingRequests(id);
  function goNextPhoto() {
    if (listing?.photoUrls) {
      if (currentPhoto === listing?.photoUrls.length - 1) {
        setCurrentPhoto(0);
      } else {
        setCurrentPhoto((prev) => prev + 1);
      }
    }
  }
  function goPrevPhoto() {
    if (listing?.photoUrls) {
      if (currentPhoto === 0) {
        setCurrentPhoto(listing.photoUrls.length - 1);
      } else {
        setCurrentPhoto((prev) => prev - 1);
      }
    }
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setRequestDialogIsOpen(true);
  }

  if (isLoading) {
    return (
      <section className="w-full px-4 py-16 flex items-center justify-center">
        <Spinner size={40} />
      </section>
    );
  }
  if (error) {
    return (
      <QueryErrorState
        error={error}
        onRetry={() => refetch()}
        notFoundTitle="Оголошення не знайдено"
        notFoundText="Можливо, власник його видалив або посилання застаріло. Подивіться інші книги в каталозі."
      />
    );
  }
  if (!listing) {
    return null;
  }

  const status = STATUS_CONFIG[listing.status];
  const isOwner = !!user && user.id === listing.ownerId;
  const myRequest = findMyActiveRequest(requests, listing.status, user?.id);
  const isArchived = listing.status === "ARCHIVED";
  return (
    <section className="px-4 py-6 flex flex-col w-full gap-6 md:px-6 lg:px-10 lg:max-w-350 lg:mx-auto md:py-8">
      <Button
        variant="ghost"
        className="max-w-40 cursor-pointer"
        nativeButton={false}
        render={
          <Link
            to="/"
            className="text-xs font-base text-muted-foreground flex items-center gap-1"
          />
        }
      >
        <IconArrowLeft />
        Назад до каталогу
      </Button>
      <div className="w-full flex flex-col mt-2 gap-2 md:flex-row md:gap-6 md:justify-between lg:gap-10 lg:items-center">
        {listing.photoUrls && listing.photoUrls.length > 0 && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="relative w-full flex flex-col h-90 lg:h-110 bg-card border border-border rounded-xl">
              <Button
                variant="outline"
                className="absolute left-4 top-0 bottom-0 my-auto shadow-sm cursor-pointer rounded-full bg-card"
                onClick={goPrevPhoto}
              >
                <IconArrowLeft />
              </Button>
              <SmartImage
                className="absolute inset-0 z-10 h-80 w-auto m-auto lg:h-90 rounded-md shadow-md"
                src={listing.photoUrls[currentPhoto]}
                alt="Listing Photo"
              />
              <Button
                variant="outline"
                className="absolute right-4 top-0 bottom-0 my-auto shadow-sm cursor-pointer rounded-full bg-card"
                onClick={goNextPhoto}
              >
                <IconArrowRight />
              </Button>
              <p className="text-sm text-card bg-muted-foreground px-2 w-fit rounded-md absolute bottom-3 right-3">
                {currentPhoto + 1}/{listing.photoUrls.length}
              </p>
            </div>
            <div className="flex items-center w-full h-20 gap-2 justify-center">
              {listing.photoUrls.map((el, i) => (
                <SmartImage
                  className={`h-15 w-15 rounded-sm ${currentPhoto === i ? "ring-2 ring-accent-vivid shadow-xl" : ""}`}
                  key={el}
                  src={el}
                  alt="Listing photo"
                />
              ))}
            </div>
          </div>
        )}
        <div className="w-full flex flex-col gap-4 px-2">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <p className="bg-muted text-foreground py-1 px-4 rounded-xl w-fit text-sm font-bold lg:text-base">
                {listing.bookGenre ?? "Жанр невідомий"}
              </p>
              <div
                className={`flex items-center gap-1.5 py-1 px-4 ${status.bg} rounded-xl`}
              >
                <status.icon
                  className={`${status.color} stroke-3 w-5 h-5 lg:w-6 lg:h-6`}
                />
                <span
                  className={`text-sm text-muted-foreground font-bold lg:text-base ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
            </div>

            <h1 className="text-foreground font-bold text-2xl leading-none mt-4 lg:text-4xl">
              {listing.bookTitle}
            </h1>
            <p className="text-foreground font-light text-sm lg:text-base">
              {listing.bookAuthor ?? "Автор невідомий"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 lg:gap-1">
            <div className="flex items-center gap-1.5">
              <IconClock className=" w-5 h-5 text-muted-foreground lg:w-5.5 lg:h-5.5" />
              <span className="text-sm text-muted-foreground">{`Опубліковано: ${formatDaysAgo(listing.createdAt)}`}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="bg-card p-5 rounded-xl shadow-sm flex flex-col gap-2">
              <p className="text-muted-foreground font-bold text-sm">
                СТАН ПРИМІРНИКА
              </p>
              <p className="text-foreground font-light text-sm lg:text-base">
                {listing.conditionDescription}
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:gap-5 lg:items-center w-full">
              <div className="flex flex-col gap-2 bg-card p-5 rounded-xl shadow-sm w-full">
                <p className="flex gap-1 items-center">
                  <IconMapPin className="w-5 h-5 text-accent-vivid" />
                  <span className="flex text-muted-foreground font-bold text-xs lg:text-sm">
                    МІСЦЕЗНАХОДЖЕННЯ
                  </span>
                </p>

                <p className="text-xs text-muted-foreground lg:text-sm">
                  {!listing.settlementName
                    ? "Місто не вказано"
                    : `${SETTLEMENT_TYPE_LABELS[listing.settlementType].substring(0, 1).toLowerCase()}.${listing.settlementName}, ${listing.region}`}
                </p>
              </div>
              <div className="flex flex-col gap-2 bg-card p-5 rounded-xl shadow-sm w-full">
                <p className="flex items-center gap-1">
                  <IconBox className="w-5 h-5 text-accent-vivid" />
                  <span className="text-muted-foreground font-bold text-xs lg:text-sm">
                    СПОСІБ ОТРИМАННЯ
                  </span>
                </p>
                <p className="text-xs text-muted-foreground lg:text-sm">
                  {listing.deliveryMethods
                    .map((el) => DELIVERY_METHODS[el])
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-5 border-t border-border py-4">
            <UserLink
              userId={listing.ownerId}
              className="w-full flex items-center gap-3 lg:flex-1 lg:gap-4 bg-card p-5 rounded-xl shadow-sm transition-colors hover:bg-muted/60"
            >
              <div className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden bg-primary flex items-center justify-center lg:w-13 lg:h-13">
                {listing.ownerAvatarUrl && !avatarFailed ? (
                  <SmartImage
                    src={listing.ownerAvatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <p className="text-primary-foreground text-sm font-semibold">
                    {listing.ownerName.substring(0, 1).toUpperCase()}
                  </p>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm text-foreground font-bold underline-offset-2 group-hover:underline lg:text-base">
                  {listing.ownerName}
                </p>
                {owner && (
                  <p className="text-sm font-light text-foreground">
                    {formatMemberSince(owner.createdAt)}
                  </p>
                )}
                <div className="flex items-center gap-2.5 lg:gap-2">
                  <p className="flex items-center gap-0.5 h-6">
                    <IconStarFilled className="w-4 h-4 text-yellow-500 lg:w-5 lg:h-5" />
                    <span className="text-sm font-medium text-foreground">
                      {Number(listing.ownerRatingAvg ?? 0).toFixed(1)}
                    </span>
                  </p>
                  {owner && (
                    <p className="text-sm font-light text-foreground">
                      {pluralizeExchanges(owner.booksGiven + owner.booksTaken)}
                    </p>
                  )}
                </div>
              </div>
              <IconChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </UserLink>
            {!isOwner &&
              (myRequest?.status === "ACTIVE" && myRequest.exchangeId ? (
                <Button
                  className="cursor-pointer w-full h-10"
                  nativeButton={false}
                  render={<Link to={`/exchanges/${myRequest.exchangeId}`} />}
                >
                  Перейти до обміну
                  <IconArrowRight />
                </Button>
              ) : myRequest ? (
                <div className="flex flex-col gap-1.5">
                  <Button className="w-full h-10 gap-2" disabled>
                    <IconCheck />
                    Заявку вже надіслано
                  </Button>
                  <Link
                    to="/requests?tab=sent"
                    className="self-center text-sm font-semibold text-accent-vivid hover:underline"
                  >
                    Переглянути мої заявки
                  </Link>
                </div>
              ) : (
                <Button
                  className="cursor-pointer w-full h-10"
                  disabled={isArchived || (isAuthenticated && requestsLoading)}
                  onClick={(e) => handleClick(e)}
                >
                  {isArchived
                    ? "Оголошення знято з публікації"
                    : "Подати заявку"}
                </Button>
              ))}
            {requestDialogIsOpen && (
              <RequestFormDialog
                listing={listing}
                open={requestDialogIsOpen}
                onOpenChange={setRequestDialogIsOpen}
              />
            )}
          </div>
        </div>
      </div>

      <ListingRequestQueue
        requests={requests}
        isLoading={requestsLoading}
        isError={requestsError}
        listingStatus={listing.status}
        currentUserId={user?.id ?? null}
        isOwner={isOwner}
      />
    </section>
  );
}
