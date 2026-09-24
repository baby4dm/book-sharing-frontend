import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { UserResponse } from "../types";
import { Label } from "@/components/ui/label";
import type { SettlementType } from "@/features/listings/types";
import { Input } from "@/components/ui/input";
import SingleSelectList from "@/components/ui/SingleSelectList";
import { REGIONS } from "@/lib/constants";

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
  return (
    <div>
      <h1>Profile Editing Form</h1>
      <div>
        <div>
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
          <Button variant="ghost" className="cursor-pointer">
            Змінити фото
          </Button>
        </div>
        <form>
          <div>
            <Label htmlFor="name">Ім'я</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-foreground">Спосіб доставки</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
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
          <div>
            <Label>Область</Label>
            <SingleSelectList
              options={REGIONS}
              placeholder="Вибрати область"
              selected={region}
              onChange={setRegion}
            />
          </div>
          <div>
            <Label>Місто</Label>
            <Input />
          </div>
        </form>
      </div>
    </div>
  );
}
