import { useState } from "react";
import { Link } from "react-router-dom";
import { IconMessageCircle, IconSearch } from "@tabler/icons-react";
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
      <div className="flex flex-col gap-3 px-4 pt-4.5 pb-3">
        <h1 className="font-heading text-[26px] leading-tight font-semibold">
          Чат
        </h1>
        <div className="relative">
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-muted-foreground"
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
            className="h-10.5 w-full rounded-[10px] border border-border bg-background pr-3 pl-9.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/20"
          />
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-10 text-center">
          <IconMessageCircle className="size-9 text-muted-foreground/60" />
          <p className="font-semibold">Розмов поки немає</p>
          <p className="text-sm text-muted-foreground">
            Чат з'являється, коли власник підтверджує заявку на книгу.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Нічого не знайдено за «{query.trim()}»
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto pb-2">
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
        "flex gap-3 border-l-[3px] px-4 py-3 transition-colors",
        active
          ? "border-primary bg-accent/60"
          : "border-transparent hover:bg-muted/60",
      )}
    >
      <UserAvatar
        name={room.otherUserName}
        src={room.otherUserAvatarUrl}
        className="h-11 w-11"
        fallbackClassName="font-sans text-base font-extrabold"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-[15px]",
              unread ? "font-extrabold" : "font-bold",
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
          <span className="truncate text-[13px] font-semibold text-primary">
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
              className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-extrabold text-primary-foreground"
            >
              {room.unreadCount > 99 ? "99+" : room.unreadCount}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
