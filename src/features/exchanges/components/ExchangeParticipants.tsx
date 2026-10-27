import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { IconStarFilled } from "@tabler/icons-react";
import type { ExchangeParticipant } from "../types";
import UserLink from "@/features/userProfile/components/UserLink";
import OpenExchangeChatButton from "@/features/chats/components/OpenExchangeChatButton";

interface ParticipantCardProps {
  participant: ExchangeParticipant;
  role: string;
  isCurrentUser: boolean;
  exchangeId?: string;
}

function ParticipantCard({
  participant,
  role,
  isCurrentUser,
  exchangeId,
}: ParticipantCardProps) {

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 surface p-4">
      <span className="field-label">
        {role}
        {isCurrentUser && " · це ви"}
      </span>

      <UserLink
        userId={participant.id}
        className="flex items-center gap-3 self-start"
      >
        <UserAvatar name={participant.name} src={participant.avatarUrl} seed={participant.id} className="size-11" fallbackClassName="text-base" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-foreground underline-offset-2 group-hover:underline">
            {participant.name}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <IconStarFilled size={13} className="text-star" />
            {Number(participant.ratingAvg).toFixed(1)}
          </span>
        </div>
      </UserLink>

      <p className="text-xs text-muted-foreground">
        Віддано {participant.booksGiven} · Взято {participant.booksTaken}
        {participant.booksOverdue > 0 && (
          <span className="font-semibold text-destructive">
            {" "}
            · Прострочень {participant.booksOverdue}
          </span>
        )}
      </p>

      {exchangeId && !isCurrentUser && (
        <OpenExchangeChatButton
          exchangeId={exchangeId}
          className="w-full justify-center"
        />
      )}
    </div>
  );
}

interface ExchangeParticipantsProps {
  owner: ExchangeParticipant;
  reader: ExchangeParticipant;
  currentUserId: string;
  exchangeId?: string;
  layout?: "row" | "column";
}

export default function ExchangeParticipants({
  owner,
  reader,
  currentUserId,
  exchangeId,
  layout = "row",
}: ExchangeParticipantsProps) {
  return (
    <div
      className={
        layout === "column"
          ? "flex flex-col gap-3 sm:flex-row lg:flex-col"
          : "flex flex-col gap-3 sm:flex-row"
      }
    >
      <ParticipantCard
        participant={owner}
        role="Власник"
        isCurrentUser={owner.id === currentUserId}
        exchangeId={exchangeId}
      />
      <ParticipantCard
        participant={reader}
        role="Читач"
        isCurrentUser={reader.id === currentUserId}
        exchangeId={exchangeId}
      />
    </div>
  );
}
