import { Button } from "@/components/ui/button";
import { useListing } from "@/features/listings/hooks/useListing";
import { SETTLEMENT_TYPE_LABELS } from "@/features/listings/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { formatDaysAgo } from "@/lib/utils";
import {
  IconArrowLeft,
  IconArrowRight,
  IconClock,
  IconMapPin,
  IconStarFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListing(id!);
  const [currentPhoto, setCurrentPhoto] = useState(
    listing?.photoUrls && listing.photoUrls.length > 0 ? 0 : null,
  );
  if (!listing) {
    return;
  }
  const status = STATUS_CONFIG[listing.status];
  function goNextPhoto() {
    if (listing?.photoUrls && currentPhoto !== null) {
      if (currentPhoto === listing?.photoUrls.length - 1) {
        setCurrentPhoto(0);
      } else {
        setCurrentPhoto((prev) => prev! + 1);
      }
    }
  }
  function goPrevPhoto() {
    if (listing?.photoUrls && currentPhoto != null) {
      if (currentPhoto === 0) {
        setCurrentPhoto(listing.photoUrls.length - 1);
      } else {
        setCurrentPhoto((prev) => prev! - 1);
      }
    }
  }
  return (
    <section className="px-4 py-6 flex flex-col w-full gap-6">
      <Button
        variant="outline"
        className="max-w-40 cursor-pointer text-xs font-base text-muted-foreground"
      >
        <IconArrowLeft />
        Назад до каталогу
      </Button>
      <div>
        {currentPhoto !== null && (
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
                src={listing?.photoUrls[currentPhoto]}
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
              {listing?.photoUrls.map((el, i) => (
                <img
                  className={`h-20 w-15 rounded-sm shadow-xl ${currentPhoto === i ? "ring-2 ring-accent-vivid" : ""}`}
                  key={el}
                  src={el}
                  alt="Listing photo"
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col">
          <div>
            <p>{listing?.bookGenre || "Жанр невідомий"}</p>
            <h1>{listing?.bookTitle || "Назва невідома"}</h1>
            <p>{listing?.bookAuthor || "Автор невідомий"}</p>
          </div>
          <div className="flex gap-1 items-center">
            <div>
              <status.icon className={`${status.color} w-5 h-5`} />
              <span className="text-xs text-muted-foreground">
                {status.label}
              </span>
            </div>
            <div>
              <IconClock />
              <span>{`опубліковано ${formatDaysAgo(listing.createdAt)}`}</span>
            </div>
          </div>
          <div>
            <div>
              <p>СТАН ПРИМІРНИКА</p>
              <p>{listing.conditionDescription}</p>
            </div>
            <div>
              <div>
                <p>МІСЦЕЗНАХОДЖЕННЯ</p>
                <p>
                  <IconMapPin className="w-5 h-5 text-accent-vivid" />
                  <span className="text-xs text-muted-foreground">
                    {!listing.settlementName
                      ? "Місто не вказано"
                      : `${SETTLEMENT_TYPE_LABELS[listing.settlementType].substring(0, 1).toLowerCase()}.${listing.settlementName}, ${listing.region}`}
                  </span>
                </p>
              </div>
              <div>
                <p>ДОСТАВКА</p>
                <p>{listing.deliveryMethods.join(", ")}</p>
              </div>
            </div>
          </div>
          <div>
            <div>
              <div
                className="h-7 w-7 rounded-full bg-primary flex 
              items-center justify-center lg:h-8 lg:w-8"
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
