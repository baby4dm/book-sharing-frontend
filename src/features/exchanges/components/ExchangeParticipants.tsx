import { useState } from "react";
import { IconStarFilled } from "@tabler/icons-react";
import type { ExchangeParticipant } from "../types";
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
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {role}
        {isCurrentUser && " · це ви"}
      </span>

      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-base font-bold text-accent-foreground">
          {participant.avatarUrl && !avatarFailed ? (
            <img
              src={participant.avatarUrl}
              alt=""
              className="size-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            participant.name.substring(0, 1).toUpperCase()
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-foreground">
            {participant.name}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <IconStarFilled size={13} className="text-[#D99A1E]" />
            {Number(participant.ratingAvg).toFixed(1)}
          </span>
        </div>
      </div>

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
