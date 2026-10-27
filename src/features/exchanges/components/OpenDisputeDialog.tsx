import { useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
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
import { Textarea } from "@/components/ui/textarea";
import PhotoUploadGrid from "@/components/layout/PhotoUploadGrid";
import type { OpenDisputePayload } from "../types";
import { getErrorMessage } from "../utils/getErrorMessage";

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 2000;

interface OpenDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readerName: string;
  onSubmit: (payload: OpenDisputePayload) => Promise<unknown>;
}

export default function OpenDisputeDialog({
  open,
  onOpenChange,
  readerName,
  onSubmit,
}: OpenDisputeDialogProps) {
  const [reason, setReason] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedLength = reason.trim().length;
  const canSubmit =
    trimmedLength >= MIN_REASON_LENGTH &&
    photos.length > 0 &&
    !isUploading &&
    !isSubmitting;

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
    if (trimmedLength < MIN_REASON_LENGTH) {
      setError(
        `Опишіть проблему детальніше (мінімум ${MIN_REASON_LENGTH} символів)`,
      );
      return;
    }
    if (photos.length === 0) {
      setError("Додайте хоча б одне фото-доказ");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ reason: reason.trim(), urls: photos });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-5 overflow-hidden p-6 sm:max-w-xl sm:p-7">
        <DialogHeader className="flex-row items-start gap-3.5 text-left">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <IconAlertTriangle size={22} className="text-destructive" />
          </div>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl font-bold">
              Відкрити спір
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              Опишіть, що не так із поверненою книгою, і додайте фото-докази.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1">
          <ol className="flex flex-col gap-2 rounded-xl bg-background px-4 py-3.5 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <span className="font-bold text-foreground">1</span>
              Обмін переходить у статус «Спір», повернення не підтверджується.
            </li>
            <li className="flex gap-2.5">
              <span className="font-bold text-foreground">2</span>
              {readerName} отримає сповіщення й побачить причину та фото.
            </li>
            <li className="flex gap-2.5">
              <span className="font-bold text-foreground">3</span>
              Модератор порівняє фото до і після та ухвалить рішення.
            </li>
          </ol>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dispute-reason" className="text-sm font-bold" required>
              Причина спору
            </Label>
            <Textarea
              id="dispute-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={MAX_REASON_LENGTH}
              rows={4}
              disabled={isSubmitting}
              placeholder="Наприклад: на сторінках 40–60 плями, обкладинка пошкоджена"
              className="resize-none rounded-lg border-input px-3.5 py-3 text-[15px] leading-relaxed"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span
                className={
                  trimmedLength > 0 && trimmedLength < MIN_REASON_LENGTH
                    ? "text-destructive"
                    : undefined
                }
              >
                Мінімум {MIN_REASON_LENGTH} символів
              </span>
              <span>
                {reason.length} / {MAX_REASON_LENGTH}
              </span>
            </div>
          </div>

          <PhotoUploadGrid
            photos={photos}
            onChange={setPhotos}
            onBusyChange={setIsUploading}
            label="Фото-докази (від 1 до 4)"
            required
            disabled={isSubmitting}
          />

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row">
          <Button
            variant="outline"
            className="h-10 rounded-lg px-5 font-semibold"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button
            className="h-10 rounded-lg bg-destructive px-6 font-semibold text-white hover:bg-destructive/90"
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
