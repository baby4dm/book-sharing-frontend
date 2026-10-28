import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn, formatDaysAgo } from "@/lib/utils";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook,
  IconCheck,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconShield,
  IconStarFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { findMyActiveRequest } from "@/api/listingQueue";
import ListingRequestQueue from "@/features/listings/components/ListingRequestQueue";
import { useListingRequests } from "@/features/listings/hooks/useListingRequests";
import SmartImage from "@/components/ui/SmartImage";
import ReasonDialog from "@/features/moderation/components/ReasonDialog";
import {
  useHideListing,
  useRestoreListing,
} from "@/features/moderation/hooks/useModeration";
import { isModeratorRole } from "@/features/moderation/types";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [requestDialogIsOpen, setRequestDialogIsOpen] = useState(false);
  const [hideOpen, setHideOpen] = useState(false);
  const hideListing = useHideListing();
  const restoreListing = useRestoreListing();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: listing, isLoading, error, refetch } = useListing(id!);
  const { data: owner } = useUserProfile(listing?.ownerId);
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
      <section
        aria-busy="true"
        aria-label="Завантаження оголошення"
        className="mx-auto flex w-full max-w-300 flex-col gap-6 px-4 py-5 md:px-8 lg:py-8"
      >
        <Skeleton className="h-5 w-24" />
        <div className="grid w-full gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 lg:gap-14">
          <Skeleton className="mx-auto aspect-2/3 w-full max-w-60 rounded-xl md:max-w-105" />
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <div className="surface mt-2 flex flex-col divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-6 px-5 py-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
            <Skeleton className="h-18.5 rounded-xl" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>
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
  const isHidden = !!listing.hiddenAt;
  const isModerator = isModeratorRole(user?.role);
  const photos = listing.photoUrls?.length
    ? listing.photoUrls
    : listing.bookCoverUrl
      ? [listing.bookCoverUrl]
      : [];
  const photoIndex = Math.min(currentPhoto, Math.max(photos.length - 1, 0));
  const place = listing.settlementName
    ? `${SETTLEMENT_TYPE_LABELS[listing.settlementType].substring(0, 1).toLowerCase()}. ${listing.settlementName}, ${listing.region}`
    : "Місто не вказано";
  const facts = [
    {
      label: "Стан примірника",
      value: listing.conditionDescription || "Власник не описав стан",
    },
    { label: "Де знаходиться", value: place },
    {
      label: "Як отримати",
      value: listing.deliveryMethods
        .map((el) => DELIVERY_METHODS[el])
        .join(", "),
    },
    { label: "Опубліковано", value: formatDaysAgo(listing.createdAt) },
  ];
  const arrowClass =
    "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-card/90 text-foreground transition-transform duration-150 ease-(--ease-out) active:scale-[0.94] outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <section className="mx-auto flex w-full max-w-300 flex-col gap-6 px-4 py-5 md:px-8 lg:py-8">
      <Link
        to="/"
        className="flex w-fit items-center gap-1.5 rounded-full py-1 pr-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <IconArrowLeft size={18} />
        Каталог
      </Link>

      <div className="grid w-full gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 lg:gap-14">
        <div className="flex flex-col gap-3">
          <div className="relative mx-auto aspect-2/3 w-full max-w-60 md:max-w-105 overflow-hidden rounded-xl bg-muted">
            {photos.length > 0 ? (
              <SmartImage
                key={photos[photoIndex]}
                className="h-full w-full object-cover"
                src={photos[photoIndex]}
                alt={`${listing.bookTitle} — фото ${photoIndex + 1}`}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <IconBook
                  size={40}
                  stroke={1.5}
                  className="text-muted-foreground"
                />
              </div>
            )}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Попереднє фото"
                  className={`${arrowClass} left-3`}
                  onClick={goPrevPhoto}
                >
                  <IconArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Наступне фото"
                  className={`${arrowClass} right-3`}
                  onClick={goNextPhoto}
                >
                  <IconArrowRight size={18} />
                </button>
                <span className="tabular absolute right-3 bottom-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {photoIndex + 1}/{photos.length}
                </span>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex justify-center gap-2">
              {photos.map((el, i) => (
                <button
                  type="button"
                  key={el}
                  aria-label={`Фото ${i + 1}`}
                  aria-current={photoIndex === i ? "true" : undefined}
                  onClick={() => setCurrentPhoto(i)}
                  className={cn(
                    "size-14 cursor-pointer overflow-hidden rounded-lg outline-none transition-[opacity,box-shadow] duration-150 focus-visible:ring-3 focus-visible:ring-ring/50",
                    photoIndex === i
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-60 hover:opacity-100",
                  )}
                >
                  <SmartImage
                    className="h-full w-full object-cover"
                    src={el}
                    alt=""
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {isHidden && (isOwner || isModerator) && (
            <div
              role="status"
              className="flex flex-col gap-2 rounded-xl border border-destructive/20 bg-tint-red p-4 text-tint-red-ink"
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                <IconEyeOff className="size-4.5" stroke={1.75} />
                Приховано модератором
                {listing.hiddenAt && (
                  <span className="font-normal opacity-80">
                    · {formatDaysAgo(listing.hiddenAt).toLowerCase()}
                  </span>
                )}
              </p>
              {listing.hiddenReason && (
                <p className="text-sm leading-relaxed">
                  Причина: {listing.hiddenReason}
                </p>
              )}
              <p className="text-[13px] opacity-80">
                Оголошення не видно в каталозі, нові заявки не приймаються.
              </p>
              {isModerator && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-fit"
                  disabled={restoreListing.isPending}
                  onClick={() => restoreListing.mutate(listing.id)}
                >
                  <IconEye />
                  Повернути в каталог
                </Button>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {listing.bookGenre && (
                <span className="rounded-full bg-tint-neutral px-2.5 py-1 text-xs font-semibold text-tint-neutral-ink">
                  {listing.bookGenre}
                </span>
              )}
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  status.bg,
                  status.color,
                )}
              >
                <status.icon size={14} />
                {status.label}
              </span>
            </div>
            <h1 className="book-title mt-1 text-[26px] leading-tight lg:text-[32px]">
              {listing.bookTitle}
            </h1>
            <p className="text-base text-muted-foreground">
              {listing.bookAuthor ?? "Автор невідомий"}
            </p>
          </div>

          <dl className="divide-y divide-border surface">
            {facts.map((f) => (
              <div
                key={f.label}
                className="flex flex-col gap-0.5 px-5 py-3.5 sm:flex-row sm:gap-6"
              >
                <dt className="field-label shrink-0 sm:w-36">{f.label}</dt>
                <dd className="text-sm text-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>

          <UserLink
            userId={listing.ownerId}
            className="surface surface-interactive flex w-full items-center gap-3 p-4"
          >
            <UserAvatar
              name={listing.ownerName}
              src={listing.ownerAvatarUrl}
              seed={listing.ownerId}
              className="size-11"
              fallbackClassName="text-base"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[15px] font-bold underline-offset-2 group-hover:underline">
                {listing.ownerName}
              </p>
              <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
                <span className="flex items-center gap-0.5 font-semibold text-foreground">
                  <IconStarFilled size={14} className="text-star" />
                  <span className="tabular">
                    {Number(listing.ownerRatingAvg ?? 0).toFixed(1)}
                  </span>
                </span>
                {owner && (
                  <span>
                    {pluralizeExchanges(owner.booksGiven + owner.booksTaken)}
                  </span>
                )}
                {owner && <span>· {formatMemberSince(owner.createdAt)}</span>}
              </p>
            </div>
            <IconChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </UserLink>

          {!isOwner &&
            !isModerator &&
            (myRequest?.status === "ACTIVE" && myRequest.exchangeId ? (
              <Button
                className="h-10 w-full"
                nativeButton={false}
                render={<Link to={`/exchanges/${myRequest.exchangeId}`} />}
              >
                Перейти до обміну
                <IconArrowRight />
              </Button>
            ) : myRequest ? (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-tint-green px-5 py-4 text-center text-tint-green-ink">
                <p className="flex items-center gap-1.5 text-sm font-bold">
                  <IconCheck size={18} />
                  Заявку вже надіслано
                </p>
                <Link
                  to="/requests?tab=sent"
                  className="text-sm font-semibold underline underline-offset-2"
                >
                  Переглянути мої заявки
                </Link>
              </div>
            ) : (
              <Button
                className="h-10 w-full"
                disabled={
                  isArchived || isHidden || (isAuthenticated && requestsLoading)
                }
                onClick={(e) => handleClick(e)}
              >
                {isArchived
                  ? "Оголошення знято з публікації"
                  : isHidden
                    ? "Оголошення приховано"
                    : "Подати заявку"}
              </Button>
            ))}
          {isModerator && !isHidden && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border-strong px-4 py-3">
              <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <IconShield className="size-4" stroke={1.75} />
                Ви модератор
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-tint-red hover:text-destructive"
                onClick={() => setHideOpen(true)}
              >
                <IconEyeOff />
                Приховати оголошення
              </Button>
            </div>
          )}
          <ReasonDialog
            open={hideOpen}
            onOpenChange={setHideOpen}
            title="Приховати оголошення?"
            description="Його не буде видно в каталозі, і на нього не можна буде подати заявку. Власник отримає сповіщення з причиною. Поточні обміни не зачіпаються."
            confirmLabel="Приховати"
            quickReasons={[
              "Неприйнятний зміст фото чи опису",
              "Це не книга або оголошення-спам",
              "Продаж замість безкоштовного обміну",
              "Дублікат іншого оголошення",
            ]}
            onConfirm={(reason) =>
              hideListing.mutateAsync({ id: listing.id, reason })
            }
          />
          {requestDialogIsOpen && (
            <RequestFormDialog
              listing={listing}
              open={requestDialogIsOpen}
              onOpenChange={setRequestDialogIsOpen}
            />
          )}
        </div>
      </div>

      <ListingRequestQueue
        requests={requests}
        isLoading={requestsLoading}
        isError={requestsError}
        listingStatus={listing.status}
        currentUserId={user?.id ?? null}
        isOwner={isOwner}
        isModerator={isModerator}
      />
    </section>
  );
}
