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
    <section className="px-4 py-6 flex flex-col w-full gap-6">
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
      <div className="flex flex-col gap-2">
        {listing.photoUrls && listing.photoUrls.length > 0 && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="relative w-full flex flex-col bg-muted h-90">
              <Button
                variant="outline"
                className="absolute left-2 top-0 bottom-0 my-auto shadow-sm cursor-pointer"
                onClick={goPrevPhoto}
              >
                <IconArrowLeft />
              </Button>
              <img
                className="absolute inset-0 z-10 h-80 w-auto m-auto"
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
        <div className="flex flex-col gap-4 px-2">
          <div className="flex flex-col gap-1">
            <p className="bg-muted text-foreground py-1 px-5 rounded-md w-fit text-sm font-bold">
              {listing.bookGenre ?? "Жанр невідомий"}
            </p>
            <h1 className="text-foreground font-bold text-2xl leading-none mt-4">
              {listing.bookTitle}
            </h1>
            <p className="text-foreground font-light text-sm">
              {listing.bookAuthor ?? "Автор невідомий"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <status.icon className={`${status.color} stroke-3 w-5 h-5`} />
              <span className="text-sm text-muted-foreground">
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconClock className=" w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{`Опубліковано ${formatDaysAgo(listing.createdAt)}`}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="flex text-muted-foreground font-bold text-xs">
                СТАН ПРИМІРНИКА
              </p>
              <p className="text-foreground font-light text-sm">
                {listing.conditionDescription}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="flex gap-1 items-center">
                  <IconMapPin className="w-5 h-5 text-accent-vivid" />
                  <span className="flex text-muted-foreground font-bold text-xs">
                    МІСЦЕЗНАХОДЖЕННЯ
                  </span>
                </p>

                <p className="text-xs text-muted-foreground">
                  {!listing.settlementName
                    ? "Місто не вказано"
                    : `${SETTLEMENT_TYPE_LABELS[listing.settlementType].substring(0, 1).toLowerCase()}.${listing.settlementName}, ${listing.region}`}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-1">
                  <IconBox className="w-5 h-5 text-accent-vivid" />
                  <span className="text-muted-foreground font-bold text-xs">
                    СПОСІБ ОТРИМАННЯ
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {listing.deliveryMethods
                    .map((el) => DELIVERY_METHODS[el])
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div>
              <div
                className={`h-7 w-7 rounded-full bg-${listing.ownerAvatarUrl} flex 
              items-center justify-center lg:h-8 lg:w-8`}
              >
                <p className="text-primary-foreground text-xs font-medium">
                  ОК
                </p>
              </div>
              <div>
                <p>{listing.ownerName}</p>
                <div>
                  <p>
                    <IconStarFilled />
                    <span>{listing.ownerRatingAvg}</span>
                  </p>
                  <p>8 обмінів</p>
                </div>
              </div>
            </div>

            <Button>Подати заявку</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
