import { useState } from "react";
import type { UserResponse } from "../types";
import { Button } from "@/components/ui/button";
import { SETTLEMENT_TYPE_LABELS } from "@/features/listings/types";
import { IconMapPin, IconStarFilled } from "@tabler/icons-react";

interface ProfileViewProps {
  userData: UserResponse;
  onEditing: (value: boolean) => void;
}

export default function ProfileView({ userData, onEditing }: ProfileViewProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const createDate = new Date(userData.createdAt);
  return (
    <div className="flex flex-col gap-4 items-center text-center w-full">
      <div className="flex flex-col gap-4 items-center">
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
        <div className="flex flex-col gap-3 items-center text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-xl font-extrabold md:text-2xl">
                {userData.name}
              </h1>
              <p className="flex items-center gap-1">
                <IconMapPin className="w-4 h-4 text-accent-vivid" />
                <span className="text-xs font-light md:text-sm">
                  {!userData.settlementName
                    ? "Місто не вказано"
                    : `${SETTLEMENT_TYPE_LABELS[userData.settlementType || ""].substring(0, 1).toLowerCase()}.${userData.settlementName}, ${userData.region}`}
                </span>
              </p>
              <p className="text-xs text-muted-foreground md:text-sm">
                На сервісі з{" "}
                {createDate.toLocaleDateString("uk-UA", { month: "long" }) +
                  " " +
                  createDate.getFullYear()}
              </p>
            </div>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => onEditing(true)}
            >
              Редагувати профіль
            </Button>
          </div>
          <p className="text-sm text-muted-foreground md:text-base">
            {userData.bio ||
              "Люблю фантастику і детективи. Завжди рада обмінятись книгою або порадити щось цікаве!"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full md:grid-cols-3 max-w-120 md:max-w-160">
        {userData.ratingAvg && (
          <div className="border border-border rounded-lg py-4 px-8 flex flex-col gap-1 items-center w-full">
            <p className="flex items-center gap-1">
              <IconStarFilled className="text-yellow-500 w-4 h-4 md:w-5 md:h-5" />
              <span className="font-extrabold md:text-lg">
                {userData.ratingAvg.toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-muted-foreground md:text-base">
              Рейтинг
            </p>
          </div>
        )}
        {userData.booksGiven && (
          <div className="border border-border rounded-lg py-4 px-8 flex flex-col gap-1 items-center w-full">
            <p className="flex items-center gap-1">
              <span className="font-extrabold md:text-lg">
                {userData.booksGiven}
              </span>
            </p>
            <p className="text-sm text-muted-foreground md:text-base">Надано</p>
          </div>
        )}
        {userData.booksTaken && (
          <div className="border border-border rounded-lg py-4 px-8 flex flex-col gap-1 items-center w-full">
            <p className="flex items-center gap-1">
              <span className="font-extrabold md:text-lg">
                {userData.booksTaken}
              </span>
            </p>
            <p className="text-sm text-muted-foreground md:text-base">Взято</p>
          </div>
        )}
        {userData.booksReturnedOnTime && (
          <div className="border border-border rounded-lg py-4 px-8 flex flex-col gap-1 items-center w-full">
            <p className="flex items-center gap-1">
              <span className="font-extrabold md:text-lg">
                {userData.booksReturnedOnTime}
              </span>
            </p>
            <p className="text-sm text-muted-foreground md:text-base">
              Повернено вчасно
            </p>
          </div>
        )}
        {userData.booksDamaged && (
          <div className="border border-border rounded-lg py-4 px-8 flex flex-col gap-1 items-center w-full">
            <p className="flex items-center gap-1">
              <span className="font-extrabold md:text-lg">
                {userData.booksDamaged}
              </span>
            </p>
            <p className="text-sm text-muted-foreground md:text-base">
              Пошкоджено
            </p>
          </div>
        )}
        {userData.booksOverdue && (
          <div className="border border-border rounded-lg py-4 px-8 flex flex-col gap-1 items-center w-full">
            <p className="flex items-center gap-1">
              <span className="font-extrabold md:text-lg">
                {userData.booksOverdue}
              </span>
            </p>
            <p className="text-sm text-muted-foreground md:text-base">
              Протерміновано
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
