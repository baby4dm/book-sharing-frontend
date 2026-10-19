import { useLayoutEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import type { ChatMessage, PendingMessage } from "../types";
import {
  formatDayLabel,
  formatTime,
  isSameDay,
  isSameGroup,
} from "../utils/format";

interface MessageListProps {
  messages: ChatMessage[];
  pending: PendingMessage[];
  myId: string;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  onRetry: (tempId: string) => void;
  onDiscard: (tempId: string) => void;
}

type Row =
  | { kind: "day"; key: string; label: string }
  | {
      kind: "message";
      key: string;
      message: ChatMessage;
      mine: boolean;
      firstInGroup: boolean;
      lastInGroup: boolean;
    };

const NEAR_BOTTOM_PX = 120;
const LOAD_OLDER_PX = 80;

export default function MessageList({
  messages,
  pending,
  myId,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onRetry,
  onDiscard,
}: MessageListProps) {
  const [now] = useState(() => new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const snapshotRef = useRef({
    scrollHeight: 0,
    firstId: "",
    lastId: "",
    count: 0,
  });

  const rows: Row[] = [];
  messages.forEach((message, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    if (!prev || !isSameDay(prev.createdAt, message.createdAt)) {
      rows.push({
        kind: "day",
        key: `day-${message.createdAt.slice(0, 10)}`,
        label: formatDayLabel(message.createdAt, now),
      });
    }
    rows.push({
      kind: "message",
      key: message.id,
      message,
      mine: message.senderId === myId,
      firstInGroup: !prev || !isSameGroup(prev, message),
      lastInGroup: !next || !isSameGroup(message, next),
    });
  });

  const lastMessage = messages[messages.length - 1];
  const lastIsMine = lastMessage?.senderId === myId;
  const lastKey =
    pending.length > 0
      ? pending[pending.length - 1].tempId
      : (lastMessage?.id ?? "");

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const prev = snapshotRef.current;
    const count = messages.length + pending.length;
    const firstId = messages[0]?.id ?? "";

    if (prev.count === 0 && count > 0) {
      el.scrollTop = el.scrollHeight;
    } else if (firstId !== prev.firstId && lastKey === prev.lastId) {
      el.scrollTop += el.scrollHeight - prev.scrollHeight;
    } else if (lastKey !== prev.lastId) {
      if (nearBottomRef.current || lastIsMine || pending.length > 0) {
        el.scrollTop = el.scrollHeight;
      }
    }
    snapshotRef.current = {
      scrollHeight: el.scrollHeight,
      firstId,
      lastId: lastKey,
      count,
    };
  }, [messages, pending, lastKey, lastIsMine]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (el.scrollTop < LOAD_OLDER_PX && hasOlder && !isLoadingOlder) {
      onLoadOlder();
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#FAF9F6] px-3 py-4 sm:px-5.5 sm:py-5"
      role="log"
      aria-live="polite"
      aria-label="Повідомлення"
    >
      {hasOlder && (
        <div className="flex justify-center pb-3">
          {isLoadingOlder ? (
            <Spinner size={18} />
          ) : (
            <button
              type="button"
              onClick={onLoadOlder}
              className="h-8 cursor-pointer rounded-full px-3 text-[13px] font-bold text-primary hover:bg-accent"
            >
              Показати попередні
            </button>
          )}
        </div>
      )}

      {messages.length === 0 && pending.length === 0 && (
        <p className="m-auto max-w-xs text-center text-sm text-muted-foreground">
          Тут ще порожньо. Напишіть перше повідомлення — домовтеся про передачу
          книги.
        </p>
      )}

      <div className="mt-auto flex flex-col">
        {rows.map((row) => {
          if (row.kind === "day") {
            return (
              <div
                key={row.key}
                className="my-3 self-center rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground"
              >
                {row.label}
              </div>
            );
          }
          const { message, mine, firstInGroup, lastInGroup } = row;
          const isLast = message.id === lastMessage?.id && pending.length === 0;
          return (
            <div
              key={row.key}
              className={cn(
                "flex flex-col",
                mine ? "items-end" : "items-start",
                firstInGroup ? "mt-2.5" : "mt-1",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2.5 text-[15px] leading-normal wrap-break-word whitespace-pre-wrap sm:max-w-[70%]",
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground",
                  mine
                    ? lastInGroup
                      ? "rounded-[16px_16px_4px_16px]"
                      : "rounded-2xl"
                    : lastInGroup
                      ? "rounded-[16px_16px_16px_4px]"
                      : "rounded-2xl",
                )}
              >
                {message.content}
              </div>
              {lastInGroup && (
                <span className="mt-1 px-1 text-xs text-muted-foreground">
                  <time dateTime={message.createdAt}>
                    {formatTime(message.createdAt)}
                  </time>
                  {mine &&
                    isLast &&
                    (message.readAt ? " · Прочитано" : " · Надіслано")}
                </span>
              )}
            </div>
          );
        })}

        {pending.map((item) => (
          <div key={item.tempId} className="mt-1 flex flex-col items-end">
            <div
              className={cn(
                "max-w-[85%] rounded-[16px_16px_4px_16px] px-3.5 py-2.5 text-[15px] leading-normal wrap-break-word whitespace-pre-wrap sm:max-w-[70%]",
                item.status === "failed"
                  ? "border border-destructive/40 bg-destructive/5 text-foreground"
                  : "bg-primary/70 text-primary-foreground",
              )}
            >
              {item.content}
            </div>
            {item.status === "sending" ? (
              <span className="mt-1 px-1 text-xs text-muted-foreground">
                Надсилається…
              </span>
            ) : (
              <span className="mt-1 flex items-center gap-2 px-1 text-xs">
                <span className="text-destructive">Не надіслано</span>
                <button
                  type="button"
                  onClick={() => onRetry(item.tempId)}
                  className="cursor-pointer font-bold text-primary hover:underline"
                >
                  Повторити
                </button>
                <button
                  type="button"
                  onClick={() => onDiscard(item.tempId)}
                  className="cursor-pointer text-muted-foreground hover:underline"
                >
                  Видалити
                </button>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
