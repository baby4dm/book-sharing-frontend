import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconMapPin, IconPencil, IconShieldCheck } from "@tabler/icons-react";
import { isModeratorRole, ROLE_LABELS } from "@/features/moderation/types";
import type { PublicUserProfile } from "../types";
import { formatMemberSince, formatUserLocation } from "../utils/profileFormat";
import UserAvatar from "./UserAvatar";

interface ProfileViewProps {
  userData: PublicUserProfile & { email?: string };
  onEditing?: (value: boolean) => void;
  actions?: ReactNode;
}

export default function ProfileView({
  userData,
  onEditing,
  actions,
}: ProfileViewProps) {
  const location = formatUserLocation(userData);
  const isOwn = Boolean(onEditing);
  const isStaff = isModeratorRole(userData.role);

  return (
    <aside className="flex w-full flex-col items-center gap-4 surface p-6 text-center md:p-7 lg:sticky lg:top-24 lg:w-85 lg:shrink-0">
      <UserAvatar
        name={userData.name}
        src={userData.avatarUrl}
        seed={userData.id}
        className="h-24 w-24 md:h-28 md:w-28"
        fallbackClassName="text-4xl md:text-5xl"
      />

      <div className="flex w-full min-w-0 flex-col gap-1">
        <h1 className="page-title wrap-break-word">{userData.name}</h1>
        {userData.email && (
          <p className="truncate text-sm text-muted-foreground">
            {userData.email}
          </p>
        )}
        {isStaff && (
          <span className="mt-1.5 inline-flex items-center gap-1.5 self-center rounded-full bg-tint-blue px-2.5 py-1 text-xs font-semibold text-tint-blue-ink">
            <IconShieldCheck className="size-3.5" stroke={2} />
            {ROLE_LABELS[userData.role]}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        {!isStaff && (
          <p className="flex items-center justify-center gap-1.5">
            <IconMapPin className="size-4 shrink-0 text-muted-foreground" />
            {location ?? (
              <span className="text-muted-foreground">Місто не вказано</span>
            )}
          </p>
        )}
        <p className="text-muted-foreground">
          {formatMemberSince(userData.createdAt)}
        </p>
      </div>

      {userData.bio?.trim() ? (
        <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-line text-muted-foreground">
          {userData.bio}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {isStaff
            ? isOwn
              ? "Розкажіть, хто ви, — це побачать користувачі у вашому профілі."
              : "Модератор BookShare."
            : isOwn
              ? "Розкажіть іншим читачам, які книги вам подобаються."
              : "Користувач ще нічого не розповів про себе."}
        </p>
      )}

      {onEditing && (
        <Button
          variant="outline"
          className="h-10 cursor-pointer gap-2 px-5"
          onClick={() => onEditing(true)}
        >
          <IconPencil className="size-4" />
          Редагувати профіль
        </Button>
      )}

      {actions && <div className="flex w-full flex-col gap-2.5">{actions}</div>}
    </aside>
  );
}
