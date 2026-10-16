import { useState } from "react";
import { IconStarFilled } from "@tabler/icons-react";
import type { ExchangeParticipant } from "../types";

interface ParticipantCardProps {
  participant: ExchangeParticipant;
  role: string;
  isCurrentUser: boolean;
}

function ParticipantCard({
  participant,
  role,
  isCurrentUser,
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
    </div>
  );
}

interface ExchangeParticipantsProps {
  owner: ExchangeParticipant;
  reader: ExchangeParticipant;
  currentUserId: string;
  /** "column" — для бічної колонки сторінки обміну */
  layout?: "row" | "column";
}

export default function ExchangeParticipants({
  owner,
  reader,
  currentUserId,
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
      />
      <ParticipantCard
        participant={reader}
        role="Читач"
        isCurrentUser={reader.id === currentUserId}
      />
    </div>
  );
}
