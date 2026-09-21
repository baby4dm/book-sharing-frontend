import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DeliveryMethod, ListingResponse } from "../../listings/types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { IconBook, IconCheck } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { useCreateRequest } from "@/features/requests/hooks/useCreateRequest";

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
  const [imageIsLoaded, setImageIsLoaded] = useState<boolean>(false);
  const [imageIsFailed, setImageIsFailed] = useState<boolean>(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(
    null,
  );
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const { mutate, isPending, isError } = useCreateRequest(listing.id);
  const [deadline, setDeadline] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [minDeadline] = useState(
    () => new Date(Date.now() + 86400000).toISOString().split("T")[0],
  );

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    if (!deadline) {
      setValidationError("Оберіть  бажаний дедлайн повернення");
      return;
    }
    if (!deliveryMethod) {
      setValidationError("Оберіть спосіб доставки");
      return;
    }

    mutate(
      {
        desiredDeadline: deadline,
        preferredDeliveryMethod: deliveryMethod,
        message: message,
      },
      {
        onSuccess: () => setShowSuccess(true),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        {showSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <IconCheck size={28} className="text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                Заявку надіслано!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Власник розгляне вашу заявку найближчим часом. Ви отримаєте
                сповіщення про рішення.
              </p>
            </div>
            <Button
              className="w-full cursor-pointer"
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
              <DialogTitle className="text-lg font-bold text-foreground lg:text-xl">
                Подати Заявку
              </DialogTitle>
            </DialogHeader>
            <div className="bg-muted rounded-lg px-2 py-3 flex gap-3 items-center lg:px-3 lg:py-4">
              <div className="relative h-12 w-12 rounded-md overflow-hidden lg:h-15 lg:w-15">
                {!imageIsLoaded && !imageIsFailed && (
                  <div className="absolute inset-0 bg-border shimmer rounded-2xl" />
                )}

                {imageIsFailed || !listing.bookCoverUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-2xl">
                    <IconBook size={32} className="text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    className={`w-full h-full transition-opacity duration-300 ${
                      imageIsLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    src={listing.bookCoverUrl}
                    alt={listing.bookTitle}
                    onLoad={() => setImageIsLoaded(true)}
                    onError={() => setImageIsFailed(true)}
                  />
                )}
              </div>
              <div>
                <p className="text-foreground text-sm font-bold lg:text-lg">
                  {listing.bookTitle}
                </p>
                <p className="text-foreground text-xs font-light lg:text-sm">
                  {listing.bookAuthor}
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="deadline" className="text-sm text-foreground">
                  Бажаний дедлайн повернення
                </Label>
                <Input
                  id="deadline"
                  value={deadline}
                  type="date"
                  onChange={(e) => setDeadline(e.target.value)}
                  min={minDeadline}
                  className="h-9 border-2 rounded-md text-muted-foreground px-3"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm text-foreground">
                  Спосіб доставки
                </Label>
                <div className="flex gap-2">
                  {listing.deliveryMethods.includes("PICKUP") && (
                    <Button
                      variant="outline"
                      className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                        deliveryMethod === "PICKUP"
                          ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setDeliveryMethod("PICKUP")}
                    >
                      Особисто
                    </Button>
                  )}

                  {listing.deliveryMethods.includes("MAIL") && (
                    <Button
                      variant="outline"
                      className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                        deliveryMethod === "MAIL"
                          ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setDeliveryMethod("MAIL")}
                    >
                      Пошта
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="message" className="text-sm text-foreground">
                  Повідомлення власнику{" "}
                  <span className="text-muted-foreground">(необов'язково)</span>
                </Label>
                <Textarea
                  id="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-sm resize-none min-w-0 w-full wrap-break-word"
                  placeholder="Напишіть кілька слів про себе чи чому хочете прочитати цю книгу"
                />

                <p className="text-sm text-destructive mt-2 h-4">
                  {validationError ??
                    (isError
                      ? "Не вдалось надіслати заявку. Спробуйте ще раз."
                      : "")}
                </p>
              </div>
              <Button
                type="submit"
                variant="default"
                className="cursor-pointer"
                disabled={isPending}
              >
                {isPending ? "Надсилання" : "Надіслати Заявку"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
