import { useState } from "react";
import { Button } from "@/components/ui/button";
import PhotoUploadGrid from "@/components/layout/PhotoUploadGrid";
import type { ShipmentInfoResponse } from "../types";
import { getErrorMessage } from "../utils/getErrorMessage";

const CARRIER_LABELS = {
  NOVA_POSHTA: "Нова Пошта",
  UKRPOSHTA: "Укрпошта",
  OTHER: "Інший перевізник",
} as const;

interface WaybillFormProps {
  shipment: ShipmentInfoResponse;
  onSubmit: (waybillPhotoUrl: string) => Promise<unknown>;
}

export default function WaybillForm({ shipment, onSubmit }: WaybillFormProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(photos[0]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = photos.length === 1 && !isUploading && !isSubmitting;

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="rounded-lg bg-secondary p-3 text-s  m">
        <p className="font-semibold">Куди відправити</p>
        <p className="mt-1">{shipment.recipientName}</p>
        <p className="text-muted-foreground">{shipment.recipientPhone}</p>
        <p className="mt-1">
          {CARRIER_LABELS[shipment.carrier]} · №{shipment.branchNumber},{" "}
          {shipment.city}
        </p>
      </div>

      <PhotoUploadGrid
        photos={photos}
        onChange={setPhotos}
        onBusyChange={setIsUploading}
        label="Фото накладної"
        required
        maxPhotos={1}
        disabled={isSubmitting}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        className="cursor-pointer w-full md:w-fit"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Зачекайте..." : "Позначити як відправлене"}
      </Button>
    </div>
  );
}
