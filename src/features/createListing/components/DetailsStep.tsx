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
import StepHeader from "./StepHeader";
import { useResolveBook } from "../hooks/useResolveBook";
import PhotoUploadGrid from "../../../components/layout/PhotoUploadGrid";
import { useCreateListing } from "../hooks/useCreateListing";
import { Link } from "react-router-dom";
import SmartImage from "@/components/ui/SmartImage";

interface DetailsStepProps {
  book: BookSearchResult;
  onCancel: () => void;
  onSuccess: (id: string, title: string) => void;
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
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);
  const profileLocationLabel = profile?.settlementName
    ? `${SETTLEMENT_TYPE_LABELS[profile.settlementType!].substring(0, 1).toLowerCase()}. ${profile.settlementName}`
    : null;

  const [settlementType, setSettlementType] = useState<SettlementType | null>(
    null,
  );
  const [region, setRegion] = useState<string | null>(null);
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
  const hasProfileLocation = !!(
    profile?.settlementType &&
    profile.region &&
    profile.settlementName
  );

  const useProfileLocation = manualOverride ?? hasProfileLocation;

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

    const effectiveSettlementType = useProfileLocation
      ? profile?.settlementType
      : settlementType;
    const effectiveRegion = useProfileLocation ? profile?.region : region;
    const effectiveSettlementName = useProfileLocation
      ? profile?.settlementName
      : settlement.trim();

    if (!effectiveSettlementType) {
      setValidationError("Оберіть тип населеного пункту");
      return;
    }
    if (!effectiveRegion) {
      setValidationError("Оберіть область");
      return;
    }
    if (!effectiveSettlementName) {
      setValidationError("Вкажіть населений пункт");
      return;
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
              settlementType: effectiveSettlementType,
              region: effectiveRegion,
              settlementName: effectiveSettlementName,
            },
            {
              onSuccess: (listing) => {
                onSuccess(listing.id, listing.bookTitle);
              },
            },
          );
        },
      },
    );
  }

  function handleToggleProfileLocation() {
    if (!hasProfileLocation) {
      setValidationError(
        "У профілі не вказано населений пункт. Спочатку вкажіть його в профілі",
      );
      return;
    }
    setValidationError(null);
    setManualOverride(!useProfileLocation);
  }

  return (
    <div className="flex w-full max-w-180 flex-col gap-6">
      <StepHeader step={2} backLabel="Назад до пошуку" onBack={onCancel} />
      <h1 className="page-title">Деталі оголошення</h1>
      <div className="surface flex w-full items-center gap-4 p-4">
        <div className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-md bg-muted shadow-[inset_0_0_0_1px_var(--border)]">
          {!imageIsLoaded && !imageIsFailed && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}

          {imageIsFailed || !book.coverUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <IconBook size={32} className="text-muted-foreground" />
            </div>
          ) : (
            <SmartImage
              className={`size-full object-cover transition-opacity duration-300 ${
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
          <h2 className="book-title text-lg leading-snug">{book.title}</h2>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PhotoUploadGrid
          className="surface p-5"
          photos={photos}
          onChange={setPhotos}
          label="Фото примірника"
          description="Необов'язково, до 4 фото. З фото заявок приходить більше."
        />
        <div className="flex flex-col gap-1.5 surface p-5">
          <Label className="section-title" required>
            Стан примірника
          </Label>
          <Textarea
            placeholder="Легкі потертості на обкладинці, всередині чисто"
            value={conditionDescription}
            onChange={(e) => setConditionDescription(e.target.value)}
          />
          <p className="text-sm self-end">{conditionDescription.length}/2000</p>
        </div>
        <div className="flex flex-col gap-1.5 surface p-5">
          <div className="flex flex-col">
            <Label className="section-title" required>
              Як можна отримати
            </Label>
            <p className="text-sm text-muted-foreground">Можна обрати обидва</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              className={`flex-1 h-9 text-sm font-medium cursor-pointer bg-card ${
                deliveryMethods.includes("PICKUP")
                  ? "border-ring/40 bg-accent font-semibold text-accent-foreground hover:border-ring/50 hover:bg-accent"
                  : "text-muted-foreground"
              }`}
              onClick={() => toggleDeliveryMethod("PICKUP")}
            >
              Особисто
            </Button>
            <Button
              variant="outline"
              type="button"
              className={`flex-1 h-9 text-sm font-medium cursor-pointer bg-card ${
                deliveryMethods.includes("MAIL")
                  ? "border-ring/40 bg-accent font-semibold text-accent-foreground hover:border-ring/50 hover:bg-accent"
                  : "text-muted-foreground"
              }`}
              onClick={() => toggleDeliveryMethod("MAIL")}
            >
              Пошта
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3.5 surface p-5">
          <h2 className="text-[17px] font-bold">Де знаходиться книга</h2>

          <label
            className={`flex items-center gap-3.5 rounded-xl bg-background p-3.5 transition-colors ${
              hasProfileLocation
                ? "cursor-pointer hover:bg-muted"
                : "cursor-not-allowed opacity-60"
            }`}
          >
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">
                Як у профілі
              </span>
              <span className="block text-sm text-muted-foreground">
                {hasProfileLocation
                  ? `${profileLocationLabel}, ${profile?.region}`
                  : "У профілі не вказано населений пункт"}
              </span>
            </span>

            <input
              type="checkbox"
              role="switch"
              checked={useProfileLocation}
              onChange={handleToggleProfileLocation}
              disabled={!hasProfileLocation}
              aria-label="Використати населений пункт із профілю"
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-7 w-11.5 shrink-0 rounded-full bg-input transition-colors
                 after:absolute after:left-0.75 after:top-0.75 after:size-5.5 after:rounded-full
                 after:bg-white after:shadow-sm after:transition-transform
                 peer-checked:bg-primary peer-checked:after:translate-x-4.5
                 peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50"
            />
          </label>

          <p className="text-[13px] text-muted-foreground">
            {hasProfileLocation ? (
              "Вимкніть, щоб вказати інший населений пункт: тип, область і назву."
            ) : (
              <>
                Вкажіть його в{" "}
                <Link
                  to="/profile"
                  className="font-semibold text-primary hover:underline"
                >
                  профілі
                </Link>{" "}
                або заповніть поля нижче.
              </>
            )}
          </p>
        </div>
        {!useProfileLocation && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 surface p-5">
              <Label className="section-title" required>
                Тип населеного пункту
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className={`flex-1 h-9 text-sm font-medium ${
                    settlementType === "VILLAGE"
                      ? "border-ring/40 bg-accent font-semibold text-accent-foreground hover:border-ring/50 hover:bg-accent"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setSettlementType("VILLAGE")}
                >
                  Село
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  className={`flex-1 h-9 text-sm font-medium ${
                    settlementType === "SETTLEMENT"
                      ? "border-ring/40 bg-accent font-semibold text-accent-foreground hover:border-ring/50 hover:bg-accent"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setSettlementType("SETTLEMENT")}
                >
                  Селище
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className={`flex-1 h-9 text-sm font-medium ${
                    settlementType === "CITY"
                      ? "border-ring/40 bg-accent font-semibold text-accent-foreground hover:border-ring/50 hover:bg-accent"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setSettlementType("CITY")}
                >
                  Місто
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 surface p-5">
              <Label className="section-title" required>
                Область
              </Label>
              <SingleSelectList
                options={REGIONS}
                placeholder="Вибрати область"
                selected={region}
                onChange={setRegion}
              />
            </div>
            <div className="flex flex-col gap-1.5 surface p-5">
              <Label className="section-title" htmlFor="settlement" required>
                Населений пункт
              </Label>
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
        {(validationError || resolveBookError || createListingError) && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-tint-red px-3.5 py-2.5 text-sm text-tint-red-ink"
          >
            {validationError ??
              "Не вдалось опублікувати оголошення. Спробуйте ще раз."}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full sm:w-auto sm:self-end sm:px-6"
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
