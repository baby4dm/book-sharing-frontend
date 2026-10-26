import { useState } from "react";
import {
  IconBook,
  IconBox,
  IconCheck,
  IconHeartHandshake,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import { useCreateRequest } from "@/features/requests/hooks/useCreateRequest";
import { cn, pluralizeDays } from "@/lib/utils";
import type { DeliveryMethod, ListingResponse } from "../../listings/types";
import SmartImage from "@/components/ui/SmartImage";

const PRESET_DAYS = [7, 14, 21, 30] as const;
const MIN_DAYS = 1;
const MAX_DAYS = 90;
const MAX_MESSAGE_LENGTH = 2000;

interface RequestFormDialogProps {
  listing: ListingResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestFormDialog({
  listing,
  open,
  onOpenChange,
}: RequestFormDialogProps) {
  const [imageIsLoaded, setImageIsLoaded] = useState(false);
  const [imageIsFailed, setImageIsFailed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(
    () =>
      listing.deliveryMethods.length === 1
        ? (listing.deliveryMethods[0] as DeliveryMethod)
        : null,
  );
  const [readingDays, setReadingDays] = useState<number>(14);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate, isPending, isError, error } = useCreateRequest(listing.id);

  const days = customMode ? Number(customValue) : readingDays;
  const daysValid =
    Number.isInteger(days) && days >= MIN_DAYS && days <= MAX_DAYS;

  function pickPreset(value: number) {
    setReadingDays(value);
    setCustomMode(false);
    setValidationError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    if (!daysValid) {
      setValidationError(
        `Вкажіть термін читання від ${MIN_DAYS} до ${MAX_DAYS} днів`,
      );
      return;
    }
    if (!deliveryMethod) {
      setValidationError("Оберіть спосіб отримання");
      return;
    }

    mutate(
      {
        readingDays: days,
        preferredDeliveryMethod: deliveryMethod,
        message: message.trim(),
      },
      { onSuccess: () => setShowSuccess(true) },
    );
  }

  const errorText =
    validationError ??
    (isError
      ? getErrorMessage(error, "Не вдалось надіслати заявку. Спробуйте ще раз.")
      : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] flex-col gap-5 overflow-y-auto rounded-2xl p-6 sm:max-w-135 sm:p-7"
      >
        {showSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/10">
              <IconCheck size={28} className="text-success" />
            </div>
            <div>
              <p className="font-heading text-xl font-semibold">
                Заявку надіслано!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Власник розгляне її найближчим часом — ви отримаєте сповіщення
                про рішення.
              </p>
            </div>
            <Button
              className="h-11 w-full cursor-pointer rounded-[10px] font-bold"
              onClick={() => {
                setShowSuccess(false);
                onOpenChange(false);
              }}
            >
              Зрозуміло
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl font-semibold">
                Подати заявку
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3.5 rounded-xl bg-background p-3">
              <div className="relative h-17.5 w-12 shrink-0 overflow-hidden rounded-[5px] bg-secondary">
                {!imageIsLoaded && !imageIsFailed && listing.bookCoverUrl && (
                  <div className="shimmer absolute inset-0 bg-border" />
                )}
                {imageIsFailed || !listing.bookCoverUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconBook size={24} className="text-muted-foreground" />
                  </div>
                ) : (
                  <SmartImage
                    className={cn(
                      "h-full w-full object-cover transition-opacity duration-300",
                      imageIsLoaded ? "opacity-100" : "opacity-0",
                    )}
                    src={listing.bookCoverUrl}
                    alt=""
                    onLoad={() => setImageIsLoaded(true)}
                    onError={() => setImageIsFailed(true)}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-semibold">
                  {listing.bookTitle}
                </p>
                {listing.bookAuthor && (
                  <p className="truncate text-sm text-muted-foreground">
                    {listing.bookAuthor}
                  </p>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-5"
            >
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2.5 text-sm font-semibold">
                  Скільки днів вам потрібно на читання?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {PRESET_DAYS.map((value) => {
                    const active = !customMode && readingDays === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickPreset(value)}
                        className={cn(
                          "h-11 cursor-pointer rounded-[10px] border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          active
                            ? "border-primary bg-accent font-bold text-accent-foreground"
                            : "border-input bg-card text-foreground/80 hover:bg-muted",
                        )}
                      >
                        {pluralizeDays(value)}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    aria-pressed={customMode}
                    onClick={() => {
                      setCustomMode(true);
                      setCustomValue((v) => v || String(readingDays));
                      setValidationError(null);
                    }}
                    className={cn(
                      "h-11 cursor-pointer rounded-[10px] border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      customMode
                        ? "border-primary bg-accent font-bold text-accent-foreground"
                        : "border-input bg-card text-foreground/80 hover:bg-muted",
                    )}
                  >
                    Інше
                  </button>
                </div>

                {customMode && (
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="reading-days" className="sr-only">
                      Кількість днів
                    </Label>
                    <input
                      id="reading-days"
                      type="number"
                      inputMode="numeric"
                      min={MIN_DAYS}
                      max={MAX_DAYS}
                      autoFocus
                      value={customValue}
                      aria-invalid={!daysValid || undefined}
                      onChange={(e) => {
                        setCustomValue(e.target.value);
                        setValidationError(null);
                      }}
                      className="h-11 w-28 rounded-[10px] border border-input bg-card px-3.5 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive"
                    />
                    <span className="text-sm text-muted-foreground">
                      днів (від {MIN_DAYS} до {MAX_DAYS})
                    </span>
                  </div>
                )}

                <p className="flex gap-2 text-[13px] leading-snug text-muted-foreground">
                  <IconInfoCircle size={17} className="mt-px shrink-0" />
                  <span>
                    Відлік почнеться, коли ви підтвердите отримання книги, і
                    зупиниться, коли{" "}
                    {deliveryMethod === "PICKUP"
                      ? "передасте її власнику"
                      : deliveryMethod === "MAIL"
                        ? "відправите її назад (додасте накладну)"
                        : "відправите її назад або передасте власнику"}
                    . Час доставки не рахується.
                  </span>
                </p>
              </fieldset>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-semibold">
                  Спосіб отримання
                </legend>
                <div className="flex gap-2">
                  {listing.deliveryMethods.includes("PICKUP") && (
                    <button
                      type="button"
                      aria-pressed={deliveryMethod === "PICKUP"}
                      onClick={() => {
                        setDeliveryMethod("PICKUP");
                        setValidationError(null);
                      }}
                      className={cn(
                        "flex h-13 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] border text-[15px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        deliveryMethod === "PICKUP"
                          ? "border-[1.5px] border-primary bg-accent font-bold text-accent-foreground"
                          : "border-input bg-card font-semibold text-foreground/75 hover:bg-muted",
                      )}
                    >
                      <IconHeartHandshake size={20} />
                      Особисто
                    </button>
                  )}
                  {listing.deliveryMethods.includes("MAIL") && (
                    <button
                      type="button"
                      aria-pressed={deliveryMethod === "MAIL"}
                      onClick={() => {
                        setDeliveryMethod("MAIL");
                        setValidationError(null);
                      }}
                      className={cn(
                        "flex h-13 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] border text-[15px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        deliveryMethod === "MAIL"
                          ? "border-[1.5px] border-primary bg-accent font-bold text-accent-foreground"
                          : "border-input bg-card font-semibold text-foreground/75 hover:bg-muted",
                      )}
                    >
                      <IconBox size={20} />
                      Поштою
                    </button>
                  )}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="request-message"
                  className="text-sm font-semibold"
                >
                  Повідомлення власнику{" "}
                  <span className="font-normal text-muted-foreground">
                    (необов'язково)
                  </span>
                </Label>
                <Textarea
                  id="request-message"
                  rows={4}
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Напишіть кілька слів про себе чи чому хочете прочитати цю книгу"
                  className="resize-none rounded-[10px] border-input px-3.5 py-3 text-[15px] leading-normal"
                />
              </div>

              {errorText && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"
                >
                  {errorText}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="h-13 cursor-pointer rounded-xl text-base font-bold"
              >
                {isPending ? "Надсилання..." : "Надіслати заявку"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
