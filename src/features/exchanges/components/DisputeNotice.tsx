import { IconAlertTriangle } from "@tabler/icons-react";
import type { ExchangeResponse } from "../types";

interface DisputeNoticeProps {
  exchange: ExchangeResponse;
}

export default function DisputeNotice({ exchange }: DisputeNoticeProps) {
  if (exchange.status !== "DISPUTED") return null;

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 flex flex-col gap-2">
      <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <IconAlertTriangle size={18} />
        Спір на розгляді модератора
      </p>
      <p className="text-xs text-muted-foreground">
        Власник ({exchange.ownerName}) відкрив спір щодо стану повернутої книги.
      </p>
      {exchange.disputeReason && (
        <p className="text-sm whitespace-pre-wrap">{exchange.disputeReason}</p>
      )}
      {exchange.disputePhotos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {exchange.disputePhotos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt="Фото-доказ"
              className="w-16 h-16 rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
