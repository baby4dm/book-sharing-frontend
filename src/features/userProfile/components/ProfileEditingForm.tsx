import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { UserResponse } from "../types";
import { Label } from "@/components/ui/label";
import type { SettlementType } from "@/features/listings/types";
import { Input } from "@/components/ui/input";
import SingleSelectList from "@/components/ui/SingleSelectList";
import { REGIONS } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCurrentUserProfile } from "../hooks/useUpdateCurrentUserProfile";

interface ProfileViewProps {
  userData: UserResponse;
  onEditing: (value: boolean) => void;
}

export default function ProfileEditingForm({
  userData,
  onEditing,
}: ProfileViewProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [settlementType, setSettlementType] = useState<SettlementType | null>(
    userData.settlementType,
  );
  const [name, setName] = useState<string>(userData.name);
  const [region, setRegion] = useState<string | null>(userData.region);
  const [settlement, setSettlement] = useState<string | null>(
    userData.settlementName,
  );
  const [bio, setBio] = useState<string | null>(userData.bio);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { mutate, isPending, isError } = useUpdateCurrentUserProfile();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);
    if (!name.trim()) {
      setValidationError("Ім'я не може бути порожнім");
      return;
    }
    if (name.trim().length > 255) {
      setValidationError("Ім'я занадто довге (максимум 255 символів)");
      return;
    }
    if (!settlementType) {
      setValidationError("Оберіть тип населеного пункту");
      return;
    }
    if (!region) {
      setValidationError("Оберіть область");
      return;
    }
    if (bio && bio.length > 2000) {
      setValidationError("Опис занадто довгий (максимум 2000 символів)");
      return;
    }
    if (settlement && settlement.length > 255) {
      setValidationError("Назва населеного пункту занадто довга");
      return;
    }

    mutate(
      {
        name: name.trim(),
        settlementType,
        region,
        settlementName: settlement ?? "",
        bio: bio ?? "",
      },
      {
        onSuccess: () => onEditing(false),
      },
    );
  }
  return (
    <div className="flex flex-col gap-6 w-full p-2 max-w-178">
      <h1 className="font-extrabold md:text-xl">Редагування профілю</h1>
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex flex-col gap-1 items-center">
          <div className="relative w-18 h-18 rounded-full overflow-hidden bg-primary flex items-center justify-center md:w-25 md:h-25">
            {userData.avatarUrl && !avatarFailed ? (
              <img
                src={userData.avatarUrl}
                alt={userData.name}
                className="w-full h-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <p className="text-primary-foreground text-3xl font-semibold">
                {userData.name.substring(0, 1).toUpperCase()}
              </p>
            )}
          </div>
          <Button variant="ghost" className="cursor-pointer text-accent-vivid">
            Змінити фото
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Ім'я</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Про себе</Label>
            <Textarea
              id="bio"
              value={bio || ""}
              onChange={(e) => setBio(e.target.value)}
              className="text-sm"
            />
          </div>

          <p className="text-sm text-destructive h-4">
            {validationError !== null
              ? validationError
              : isError
                ? "Не вдалось зберегти профіль. Спробуйте ще раз."
                : ""}
          </p>

          <Button
            disabled={isPending}
            type="submit"
            className="cursor-pointer mt-3"
          >
            {isPending ? "Збереження..." : "Застосувати"}
          </Button>
        </form>
      </div>
    </div>
  );
}
