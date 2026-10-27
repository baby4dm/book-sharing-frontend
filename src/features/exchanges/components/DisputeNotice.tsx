import { IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";
import { formatDayMonth } from "@/lib/utils";
import type { ExchangePhotoResponse, ExchangeResponse } from "../types";
import SmartImage from "@/components/ui/SmartImage";

interface DisputeNoticeProps {
  exchange: ExchangeResponse;
  isOwner: boolean;
}

export default function DisputeNotice({
  exchange,
  isOwner,
}: DisputeNoticeProps) {
  if (exchange.status !== "DISPUTED") return null;

  const readerReturnPhotos = exchange.returnPhotos.filter(
    (p) => p.uploadedByUserId === exchange.readerId,
  );
  const openedAt = exchange.disputePhotos[0]?.createdAt ?? null;

  return (
    <section
      role="alert"
      className="overflow-hidden rounded-xl border border-destructive/30 bg-card"
    >
      <div className="flex gap-3 bg-destructive/10 px-5 py-4">
        <IconAlertTriangle
          size={24}
          className="mt-0.5 shrink-0 text-destructive"
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-bold text-destructive">
            Спір на розгляді модератора
          </p>
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "Ви відкрили спір"
              : `${exchange.owner.name} відкрив(ла) спір`}
            {openedAt ? ` ${formatDayMonth(openedAt)}` : ""} щодо стану
            повернутої книги. Обмін призупинено до рішення.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {exchange.disputeReason && (
          <div className="flex flex-col gap-1.5">
            <span className="field-label">
              {isOwner ? "Ваша причина" : "Причина від власника"}
            </span>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
              «{exchange.disputeReason}»
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <PhotoGroup
            title={
              isOwner
                ? "Фото читача перед поверненням"
                : "Ваші фото перед поверненням"
            }
            photos={readerReturnPhotos}
          />
          <PhotoGroup
            title="Фото-докази власника"
            photos={exchange.disputePhotos}
            danger
          />
        </div>

        <p className="flex gap-2.5 rounded-xl bg-background p-3.5 text-sm leading-relaxed text-muted-foreground">
          <IconInfoCircle size={18} className="mt-0.5 shrink-0" />
          Модератор порівняє фото при отриманні, перед поверненням і
          фото-докази. Обидва учасники отримають сповіщення з рішенням.
        </p>
      </div>
    </section>
  );
}

function PhotoGroup({
  title,
  photos,
  danger = false,
}: {
  title: string;
  photos: ExchangePhotoResponse[];
  danger?: boolean;
}) {
  if (photos.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span
        className={
          danger
            ? "text-[13px] font-bold text-destructive"
            : "text-[13px] font-bold text-muted-foreground"
        }
      >
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <a
            key={photo.id}
            href={photo.url}
            target="_blank"
            rel="noreferrer"
            className={
              danger
                ? "size-19 overflow-hidden rounded-lg ring-2 ring-destructive/30"
                : "size-19 overflow-hidden rounded-lg ring-1 ring-border"
            }
          >
            <SmartImage
              src={photo.url}
              alt={photo.note ?? title}
              className="size-full object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
