import { useState } from "react";
import type { BookSearchResult } from "../types";
import { IconBook } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { DeliveryMethod } from "@/features/listings/types";

interface DetailsStepProps {
  book: BookSearchResult;
}

export default function DetailsStep({ book }: DetailsStepProps) {
  const [imageIsLoaded, setImageIsLoaded] = useState(false);
  const [imageIsFailed, setImageIsFailed] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);

  function toggleDeliveryMethod(method: DeliveryMethod) {
    setDeliveryMethods((prev) => {
      if (prev.includes(method)) {
        return prev.filter((el) => el !== method);
      } else {
        return [...prev, method];
      }
    });
  }

  return (
    <div className="w-full flex flex-col gap-5 max-w-160 md:max-w-200 lg:max-w-220">
      <h1 className="text-2xl font-extrabold">Деталі оголошення</h1>
      <div
        className="w-full flex gap-4 items-center bg-muted
      rounded-md p-3 shadow-sm"
      >
        <div className="relative h-30 w-30 rounded-md overflow-hidden">
          {!imageIsLoaded && !imageIsFailed && (
            <div className="absolute inset-0 bg-border shimmer rounded-md" />
          )}

          {imageIsFailed || !book.coverUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-md">
              <IconBook size={32} className="text-muted-foreground" />
            </div>
          ) : (
            <img
              className={`w-30 h-full transition-opacity duration-300 ${
                imageIsLoaded ? "opacity-100" : "opacity-0"
              }`}
              src={book.coverUrl}
              alt={book.title}
              onLoad={() => setImageIsLoaded(true)}
              onError={() => setImageIsFailed(true)}
            />
          )}
        </div>
        <div className="w-full flex flex-col items-start text-start gap-1">
          <h2 className="text-sm font-bold">{book.title}</h2>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>
      </div>
      <form className="flex flex-col gap-3">
        <div>
          <Label>Стан примірника</Label>
          <Textarea placeholder="Легкі потертості на обкладинці, всередині чисто" />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="">Спосіб доставки</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                deliveryMethods.includes("PICKUP")
                  ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => toggleDeliveryMethod("PICKUP")}
            >
              Особисто
            </Button>
            <Button
              variant="outline"
              className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                deliveryMethods.includes("MAIL")
                  ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => toggleDeliveryMethod("MAIL")}
            >
              Пошта
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
