import { Button } from "@/components/ui/button";
import { useListing } from "@/features/listings/hooks/useListing";
import { SETTLEMENT_TYPE_LABELS } from "@/features/listings/types";
import { DELIVERY_METHODS, STATUS_CONFIG } from "@/lib/constants";
import { formatDaysAgo } from "@/lib/utils";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBox,
  IconClock,
  IconExchange,
  IconMapPin,
  IconStarFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListing(id!);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  if (!listing) {
    return;
  }
  const status = STATUS_CONFIG[listing.status];
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
  return (
    <section className="px-4 py-6 flex flex-col w-full gap-6 md:px-6 lg:px-10 lg:max-w-350 lg:mx-auto md:py-8">
      <Button
        variant="outline"
        className="max-w-40 cursor-pointer"
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
      <div className="w-full flex flex-col gap-2 md:flex-row md:gap-6 md:justify-between lg:gap-10 lg:items-center">
        {listing.photoUrls && listing.photoUrls.length > 0 && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="relative w-full flex flex-col bg-muted h-90 lg:h-100">
              <Button
                variant="outline"
                className="absolute left-2 top-0 bottom-0 my-auto shadow-sm cursor-pointer"
                onClick={goPrevPhoto}
              >
                <IconArrowLeft />
              </Button>
              <img
                className="absolute inset-0 z-10 h-80 w-auto m-auto lg:h-90"
                src={listing.photoUrls[currentPhoto]}
                alt="Listing Photo"
              />
              <Button
                variant="outline"
                className="absolute right-2 top-0 bottom-0 my-auto shadow-sm cursor-pointer"
                onClick={goNextPhoto}
              >
                <IconArrowRight />
              </Button>
            </div>
            <div className="flex items-center w-full h-20 gap-2 justify-center">
              {listing.photoUrls.map((el, i) => (
                <img
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
            <p className="bg-muted text-foreground py-1 px-5 rounded-md w-fit text-sm font-bold lg:text-base">
              {listing.bookGenre ?? "Жанр невідомий"}
            </p>
            <h1 className="text-foreground font-bold text-2xl leading-none mt-4 lg:text-3xl">
              {listing.bookTitle}
            </h1>
            <p className="text-foreground font-light text-sm lg:text-base">
              {listing.bookAuthor ?? "Автор невідомий"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 lg:gap-1">
            <div className="flex items-center gap-1.5">
              <status.icon
                className={`${status.color} stroke-3 w-5 h-5 lg:w-6 lg:h-6`}
              />
              <span className="text-sm text-muted-foreground lg:text-base">
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconClock className=" w-5 h-5 text-muted-foreground lg:w-6 lg:h-6" />
              <span className="text-sm text-muted-foreground lg:text-base">{`Опубліковано: ${formatDaysAgo(listing.createdAt)}`}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:gap-6">
            <div>
              <p className="flex text-muted-foreground font-bold text-xs lg:text-base">
                СТАН ПРИМІРНИКА
              </p>
              <p className="text-foreground font-light text-sm lg:text-base">
                {listing.conditionDescription}
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:gap-10 lg:items-center">
              <div className="flex flex-col gap-1">
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
              <div className="flex flex-col gap-1">
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
          <div className="w-full flex flex-col gap-5 border-t border-border py-4 lg:flex-row lg:items-center">
            <div className="w-full flex items-center gap-2 lg:flex-1 lg:gap-4">
              <div
                className="w-11 h-11 rounded-full bg-cover bg-center bg-accent-vivid lg:w-13 lg:h-13"
                style={
                  listing.ownerAvatarUrl
                    ? {
                        backgroundImage: `url(${listing.ownerAvatarUrl})`,
                      }
                    : undefined
                }
              >
                {!listing.ownerAvatarUrl && (
                  <p>{listing.ownerName.substring(0, 1).toLowerCase()}</p>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-foreground font-bold lg:text-base">
                  {listing.ownerName}
                </p>
                <div className="flex items-center gap-2.5 lg:gap-2">
                  <p className="flex items-center gap-0.5 h-6">
                    <IconStarFilled className="w-4 h-4 text-yellow-500 lg:w-5 lg:h-5" />
                    <span className="text-sm font-medium text-foreground lg:text-base">
                      {listing.ownerRatingAvg}
                    </span>
                  </p>
                  <p className="flex items-center gap-0.5">
                    <IconExchange className="w-4 h-4 stroke-2 text-accent-vivid  lg:w-5 lg:h-5" />
                    <span className="text-sm font-light text-foreground lg:text-base">
                      8 обмінів
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <Button className="cursor-pointer w-full h-10 lg:flex-1 lg:max-w-50">
              Подати заявку
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
