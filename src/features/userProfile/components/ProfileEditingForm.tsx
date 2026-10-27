import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SingleSelectList from "@/components/ui/SingleSelectList";
import { REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SettlementType } from "@/features/listings/types";
import { useUpdateCurrentUserProfile } from "../hooks/useUpdateCurrentUserProfile";
import type { UpdateProfilePayload, UserResponse } from "../types";
import AvatarUploader from "./AvatarUploader";
import RequiredMark from "@/components/ui/RequiredMark";

const BIO_MAX = 2000;
const NAME_MAX = 255;

const SETTLEMENT_OPTIONS: { value: SettlementType; label: string }[] = [
  { value: "VILLAGE", label: "Село" },
  { value: "SETTLEMENT", label: "Селище" },
  { value: "CITY", label: "Місто" },
];

type FieldError = "name" | "settlementType" | "region" | "settlement" | "bio";

interface ProfileEditingFormProps {
  userData: UserResponse;
  onEditing: (value: boolean) => void;
}

const inputClass = "h-10 md:h-10";

export default function ProfileEditingForm({
  userData,
  onEditing,
}: ProfileEditingFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userData.avatarUrl);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [name, setName] = useState(userData.name);
  const [settlementType, setSettlementType] = useState<SettlementType | null>(
    userData.settlementType,
  );
  const [region, setRegion] = useState<string | null>(userData.region);
  const [settlement, setSettlement] = useState(userData.settlementName ?? "");
  const [bio, setBio] = useState(userData.bio ?? "");
  const [error, setError] = useState<{
    field: FieldError;
    message: string;
  } | null>(null);

  const { mutate, isPending, isError } = useUpdateCurrentUserProfile();

  function validate(): { field: FieldError; message: string } | null {
    const trimmedName = name.trim();
    if (!trimmedName) return { field: "name", message: "Вкажіть ім'я" };
    if (trimmedName.length > NAME_MAX)
      return {
        field: "name",
        message: `Ім'я занадто довге (максимум ${NAME_MAX} символів)`,
      };
    if (!settlementType)
      return {
        field: "settlementType",
        message: "Оберіть тип населеного пункту",
      };
    if (!region) return { field: "region", message: "Оберіть область" };
    if (settlement.trim().length > NAME_MAX)
      return {
        field: "settlement",
        message: "Назва населеного пункту занадто довга",
      };
    if (bio.length > BIO_MAX)
      return {
        field: "bio",
        message: `Опис занадто довгий (максимум ${BIO_MAX} символів)`,
      };
    return null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    const payload: UpdateProfilePayload = {
      name: name.trim(),
      settlementType: settlementType!,
      region: region!,
      settlementName: settlement.trim(),
      bio: bio.trim(),
    };
    if (avatarUrl && avatarUrl !== userData.avatarUrl) {
      payload.avatarUrl = avatarUrl;
    }

    mutate(payload, { onSuccess: () => onEditing(false) });
  }

  const invalid = (field: FieldError) => error?.field === field || undefined;

  return (
    <div className="flex w-full max-w-170 flex-col gap-5 md:gap-5.5">
      <h1 className="page-title">Редагування профілю</h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 surface p-5 md:p-7"
      >
        <AvatarUploader
          name={name || userData.name}
          value={avatarUrl}
          onChange={setAvatarUrl}
          onUploadingChange={setIsAvatarUploading}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-name" required>
            Ім'я
          </Label>
          <Input
            id="profile-name"
            type="text"
            autoComplete="name"
            value={name}
            maxLength={NAME_MAX}
            aria-invalid={invalid("name")}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">
            Тип населеного пункту <RequiredMark />
          </legend>
          <div
            className={cn(
              "flex h-10 gap-0.5 rounded-lg border border-border bg-muted p-0.5",
              invalid("settlementType") &&
                "border-destructive ring-3 ring-destructive/15",
            )}
          >
            {SETTLEMENT_OPTIONS.map((option) => {
              const active = settlementType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSettlementType(option.value)}
                  className={cn(
                    "h-full flex-1 cursor-pointer rounded-md text-[13px] font-semibold transition-[color,background-color,box-shadow] duration-150 outline-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring",
                    active
                      ? "bg-card text-foreground shadow-[0_0_0_1px_var(--border),var(--shadow-xs)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <Label required>Область</Label>
            <div
              className={cn(
                "rounded-lg",
                invalid("region") && "ring-2 ring-destructive/30",
              )}
            >
              <SingleSelectList
                options={REGIONS}
                placeholder="Оберіть область"
                selected={region}
                onChange={setRegion}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="profile-settlement">Населений пункт</Label>
            <Input
              id="profile-settlement"
              type="text"
              placeholder="Наприклад, Київ"
              value={settlement}
              maxLength={NAME_MAX}
              aria-invalid={invalid("settlement")}
              onChange={(e) => setSettlement(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-bio">Про себе</Label>
          <Textarea
            id="profile-bio"
            rows={4}
            value={bio}
            maxLength={BIO_MAX}
            placeholder="Які книги любите, як дбаєте про чужі книги…"
            aria-invalid={invalid("bio")}
            aria-describedby="profile-bio-counter"
            onChange={(e) => setBio(e.target.value)}
            className="min-h-28"
          />
          <span
            id="profile-bio-counter"
            className="text-right text-[13px] text-muted-foreground"
          >
            {bio.length} / {BIO_MAX}
          </span>
        </div>

        {(error || isError) && (
          <p role="alert" className="text-sm text-destructive">
            {error?.message ?? "Не вдалося зберегти профіль. Спробуйте ще раз."}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2.5 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"

            disabled={isPending}
            onClick={() => onEditing(false)}
          >
            Скасувати
          </Button>
          <Button
            type="submit"

            disabled={isPending || isAvatarUploading}
          >
            {isPending ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </div>
      </form>
    </div>
  );
}
