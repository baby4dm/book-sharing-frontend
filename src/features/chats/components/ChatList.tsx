import EmptyState from "@/components/ui/empty-state";
import { useState } from "react";
import { Link } from "react-router-dom";
import { IconMessageCircle, IconSearch, IconSearchOff } from "@tabler/icons-react";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { cn } from "@/lib/utils";
import type { ChatRoom } from "../types";
import { formatListTime } from "../utils/format";

interface ChatListProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  myId: string;
}

export default function ChatList({ rooms, activeRoomId, myId }: ChatListProps) {
  const [query, setQuery] = useState("");
  const [now] = useState(() => new Date());

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? rooms.filter(
        (room) =>
          room.otherUserName.toLowerCase().includes(normalized) ||
          room.bookTitle?.toLowerCase().includes(normalized),
      )
    : rooms;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 border-b border-border px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold tracking-[-0.02em]">Чат</h1>
        <div className="relative">
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor="chat-search" className="sr-only">
            Пошук розмов
          </label>
          <input
            id="chat-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук розмов"
            className="h-9 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm shadow-xs transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15"
          />
        </div>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          className="flex-1 justify-center"
          icon={IconMessageCircle}
          title="Розмов поки немає"
          description="Чат з'являється, коли власник підтверджує заявку на книгу."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconSearchOff}
          title="Нічого не знайдено"
          description={`Немає розмов за запитом «${query.trim()}».`}
        />
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto py-1.5">
          {filtered.map((room) => (
            <li key={room.id}>
              <ChatListItem
                room={room}
                active={room.id === activeRoomId}
                myId={myId}
                now={now}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChatListItem({
  room,
  active,
  myId,
  now,
}: {
  room: ChatRoom;
  active: boolean;
  myId: string;
  now: Date;
}) {
  const unread = room.unreadCount > 0;
  const preview = room.lastMessage
    ? (room.lastMessageSenderId === myId ? "Ви: " : "") + room.lastMessage
    : "Повідомлень ще немає";

  return (
    <Link
      to={`/chat/${room.id}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "mx-1.5 flex gap-3 rounded-lg px-2.5 py-2.5 transition-colors duration-150 outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]",
        active ? "bg-accent" : "hover:bg-muted",
      )}
    >
      <UserAvatar
        name={room.otherUserName}
          seed={room.otherUserId}
        src={room.otherUserAvatarUrl}
        className="size-10"
        fallbackClassName="text-sm"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              unread ? "font-bold" : "font-semibold",
            )}
          >
            {room.otherUserName}
          </span>
          {room.lastMessageAt && (
            <span
              className={cn(
                "shrink-0 text-xs",
                unread ? "font-bold text-primary" : "text-muted-foreground",
              )}
            >
              {formatListTime(room.lastMessageAt, now)}
            </span>
          )}
        </span>
        {room.bookTitle && (
          <span className="truncate text-xs font-medium text-accent-foreground">
            «{room.bookTitle}»
          </span>
        )}
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[13px]",
              unread
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {preview}
          </span>
          {unread && (
            <span
              aria-label={`${room.unreadCount} непрочитаних`}
              className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground"
            >
              {room.unreadCount > 99 ? "99+" : room.unreadCount}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
