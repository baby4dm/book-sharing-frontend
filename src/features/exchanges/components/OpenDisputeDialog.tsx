import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PhotoUploadGrid from "@/components/layout/PhotoUploadGrid";
import type { OpenDisputePayload } from "../types";
import { getErrorMessage } from "../utils/getErrorMessage";

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 2000;

interface OpenDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: OpenDisputePayload) => Promise<unknown>;
}

export default function OpenDisputeDialog({
  open,
  onOpenChange,
  onSubmit,
}: OpenDisputeDialogProps) {
  const [reason, setReason] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setReason("");
    setPhotos([]);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (isSubmitting) return;
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit() {
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) {
      setError(
        `Опишіть проблему детальніше (мінімум ${MIN_REASON_LENGTH} символів)`,
      );
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ reason: trimmed, urls: photos });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = photos.length > 0 && !isUploading && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Відкрити спір</DialogTitle>
          <DialogDescription>
            Опишіть, що не так із поверненою книгою, і додайте фото-докази.
            Обмін буде передано на розгляд модератора.
          </DialogDescription>
        </DialogHeader>

        {/* Скролиться тільки цей блок */}
        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
          <div className="flex flex-col gap-1.5">
            <Label>Причина спору</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={MAX_REASON_LENGTH}
              rows={4}
              disabled={isSubmitting}
              placeholder="Наприклад: на сторінках 40-60 плями, обкладинка пошкоджена"
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-accent"
            />
            <p className="text-xs text-muted-foreground self-end">
              {reason.length} / {MAX_REASON_LENGTH}
            </p>
          </div>

          <PhotoUploadGrid
            photos={photos}
            onChange={setPhotos}
            onBusyChange={setIsUploading}
            label="Фото-докази (від 1 до 4)"
            disabled={isSubmitting}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Зачекайте..." : "Відкрити спір"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
