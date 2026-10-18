import { Button } from "@/components/ui/button";
import { IconMapPin, IconPencil } from "@tabler/icons-react";
import type { UserResponse } from "../types";
import { formatMemberSince, formatUserLocation } from "../utils/profileFormat";
import UserAvatar from "./UserAvatar";

interface ProfileViewProps {
  userData: UserResponse;
  onEditing: (value: boolean) => void;
}

export default function ProfileView({ userData, onEditing }: ProfileViewProps) {
  const location = formatUserLocation(userData);

  return (
    <aside className="flex w-full flex-col items-center gap-4 rounded-[20px] border border-border bg-card p-6 text-center md:p-7 lg:sticky lg:top-24 lg:w-[340px] lg:shrink-0">
      <UserAvatar
        name={userData.name}
        src={userData.avatarUrl}
        className="h-24 w-24 md:h-28 md:w-28"
        fallbackClassName="text-4xl md:text-5xl"
      />

      <div className="flex w-full min-w-0 flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold break-words md:text-[30px] md:leading-tight">
          {userData.name}
        </h1>
        <p className="truncate text-sm text-muted-foreground">
          {userData.email}
        </p>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-foreground/80">
        <p className="flex items-center justify-center gap-1.5">
          <IconMapPin className="size-4 shrink-0 text-primary" />
          {location ?? (
            <span className="text-muted-foreground">Місто не вказано</span>
          )}
        </p>
        <p className="text-muted-foreground">
          {formatMemberSince(userData.createdAt)}
        </p>
      </div>

      {userData.bio?.trim() ? (
        <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground/80">
          {userData.bio}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Розкажіть іншим читачам, які книги вам подобаються.
        </p>
      )}

      <Button
        variant="outline"
        className="h-11 cursor-pointer gap-2 rounded-[10px] px-5 font-bold"
        onClick={() => onEditing(true)}
      >
        <IconPencil className="size-4" />
        Редагувати профіль
      </Button>
    </aside>
  );
}
