import { useState } from "react";
import type { BookSearchResult } from "../types";
import { IconBook } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  SETTLEMENT_TYPE_LABELS,
  type DeliveryMethod,
  type SettlementType,
} from "@/features/listings/types";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { Input } from "@/components/ui/input";
import SingleSelectList from "@/components/ui/SingleSelectList";
import { REGIONS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import { useResolveBook } from "../hooks/useResolveBook";
import PhotoUploadGrid from "./PhotoUploadGrid";
import { useCreateListing } from "../hooks/useCreateListing";

interface DetailsStepProps {
  book: BookSearchResult;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function DetailsStep({
  book,
  onCancel,
  onSuccess,
}: DetailsStepProps) {
  const [imageIsLoaded, setImageIsLoaded] = useState(false);
  const [imageIsFailed, setImageIsFailed] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const { data: profile } = useCurrentUserProfile();
  const [useProfileLocation, setUseProfileLocation] = useState(true);
  const profileLocationLabel = profile?.settlementName
    ? `${SETTLEMENT_TYPE_LABELS[profile.settlementType!].substring(0, 1).toLowerCase()}. ${profile.settlementName}`
    : null;

  const [settlementType, setSettlementType] = useState<SettlementType | null>(
    null,
  );
  const [region, setRegion] = useState<string>("");
  const [settlement, setSettlement] = useState<string>("");
  const [conditionDescription, setConditionDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const {
    mutate: resolve,
    isPending: isResolving,
    error: resolveBookError,
  } = useResolveBook();
  const {
    mutate: createListing,
    isPending: isCreating,
    error: createListingError,
  } = useCreateListing();

  function toggleDeliveryMethod(method: DeliveryMethod) {
    setDeliveryMethods((prev) => {
      if (prev.includes(method)) {
        return prev.filter((el) => el !== method);
      } else {
        return [...prev, method];
      }
    });
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    if (!conditionDescription.trim()) {
      setValidationError("Опишіть стан примірника");
      return;
    }
    if (conditionDescription.trim().length > 2000) {
      setValidationError("Опис занадто довгий (максимум 2000 символів)");
      return;
    }
    if (deliveryMethods.length === 0) {
      setValidationError("Оберіть хоча б один спосіб доставки");
      return;
    }
    if (!useProfileLocation) {
      if (!settlementType) {
        setValidationError("Оберіть тип населеного пункту");
        return;
      }
      if (!region) {
        setValidationError("Оберіть область");
        return;
      }
      if (!settlement.trim()) {
        setValidationError("Вкажіть населений пункт");
        return;
      }
    }
    resolve(
      {
        title: book.title,
        isbn: book.isbn || undefined,
        author: book.author || undefined,
        description: book.description || undefined,
        genre: book.genre || undefined,
        coverUrl: book.coverUrl || undefined,
        externalId: book.externalId || undefined,
      },
      {
        onSuccess: (data) => {
          createListing(
            {
              bookCatalogEntryId: data.id,
              conditionDescription: conditionDescription,
              deliveryMethods: deliveryMethods,
              photoUrls: photos,
              settlementType: settlementType!,
              region: region,
              settlementName: settlement,
            },
            { onSuccess: onSuccess },
          );
        },
      },
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 max-w-160 md:max-w-200 lg:max-w-220">
      <h1 className="text-2xl font-extrabold">Деталі оголошення</h1>
      <Button
        variant="ghost"
        className="w-30 text-muted-foreground cursor-pointer"
        onClick={onCancel}
      >
        <ArrowLeft />
        <span>Крок 2 з 2</span>
      </Button>
      <div
        className="w-full flex gap-4 items-center bg-muted
      rounded-md p-3 shadow-sm"
      >
        <div className="relative h-30 w-24 rounded-md overflow-hidden">
          {!imageIsLoaded && !imageIsFailed && (
            <div className="absolute inset-0 bg-border shimmer rounded-md" />
          )}

          {imageIsFailed || !book.coverUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-md">
              <IconBook size={32} className="text-muted-foreground" />
            </div>
          ) : (
            <img
              className={`w-24 h-full transition-opacity duration-300 ${
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <PhotoUploadGrid photos={photos} onChange={setPhotos} />
        <div className="flex flex-col gap-1.5">
          <Label>Стан примірника</Label>
          <Textarea
            placeholder="Легкі потертості на обкладинці, всередині чисто"
            value={conditionDescription}
            onChange={(e) => setConditionDescription(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="">Спосіб доставки</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
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
              type="button"
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
        <Label className="flex items-center cursor-pointer my-2">
          <input
            type="checkbox"
            checked={useProfileLocation}
            onChange={() => setUseProfileLocation((prev) => !prev)}
            className="cursor-pointer w-4 h-4"
          />
          <span>
            Використати населений пункт із профілю ({profileLocationLabel})
          </span>
        </Label>
        {!useProfileLocation && (
          <div
            className={`flex flex-col gap-3 ${useProfileLocation ? "opacity-0" : "opacity-100"} transition-opacity duration-5000`}
          >
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">
                Тип населеного пункту
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                    settlementType === "VILLAGE"
                      ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setSettlementType("VILLAGE")}
                >
                  Село
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                    settlementType === "SETTLEMENT"
                      ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setSettlementType("SETTLEMENT")}
                >
                  Селище
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className={`flex-1 h-9 text-sm font-medium cursor-pointer ${
                    settlementType === "CITY"
                      ? "bg-accent-vivid text-white border-accent-vivid hover:bg-accent-vivid hover:text-white"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setSettlementType("CITY")}
                >
                  Місто
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Область</Label>
              <SingleSelectList
                options={REGIONS}
                placeholder="Вибрати область"
                selected={region}
                onChange={setRegion}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settlement">Населений пункт</Label>
              <Input
                id="settlement"
                type="text"
                value={settlement || ""}
                onChange={(e) => setSettlement(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        )}
        <p className="text-sm md:text-base text-destructive h-4">
          {validationError}
        </p>
        <Button
          type="submit"
          className="cursor-pointer mt-2"
          disabled={isResolving || isCreating}
        >
          {isResolving && "Надсилання даних"}
          {isCreating && "Створення оголошення"}
          {!isCreating && !isResolving && "Опублікувати оголошення"}
        </Button>
      </form>
    </div>
  );
}
