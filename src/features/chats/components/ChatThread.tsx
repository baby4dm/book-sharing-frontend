import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconChevronLeft } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { EXCHANGE_STATUS_CONFIG } from "@/lib/constants";
import {
  useChatMessages,
  useMarkChatAsRead,
  useSendChatMessage,
} from "../hooks/useChats";
import { useDocumentVisible } from "../hooks/useDocumentVisible";
import type { ChatRoom, PendingMessage } from "../types";
import { flattenMessages } from "../utils/chatCache";
import ChatComposer from "./ChatComposer";
import MessageList from "./MessageList";
import UserLink from "@/features/userProfile/components/UserLink";
import { useChatSocket } from "@/context/ChatSocketContext";

const TYPING_VISIBLE_MS = 4000;

interface ChatThreadProps {
  room: ChatRoom;
  myId: string;
}

export default function ChatThread({ room, myId }: ChatThreadProps) {
  const { sendTyping, onLiveEvent, setActiveRoom } = useChatSocket();
  const visible = useDocumentVisible();
  const messagesQuery = useChatMessages(room.id);
  const send = useSendChatMessage(room.id);
  const markRead = useMarkChatAsRead(room.id);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messages = flattenMessages(messagesQuery.data);

  useEffect(() => {
    setActiveRoom(room.id);
    return () => setActiveRoom(null);
  }, [room.id, setActiveRoom]);

  const { mutate: markReadMutate, isPending: isMarkingRead } = markRead;
  useEffect(() => {
    if (visible && room.unreadCount > 0 && !isMarkingRead) {
      markReadMutate();
    }
  }, [visible, room.unreadCount, isMarkingRead, markReadMutate]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = onLiveEvent((event) => {
      if (event.chatRoomId !== room.id || event.userId === myId) return;
      clearTimeout(timer);
      if (event.type === "TYPING") {
        setIsTyping(true);
        timer = setTimeout(() => setIsTyping(false), TYPING_VISIBLE_MS);
      } else if (event.type === "MESSAGE") {
        setIsTyping(false);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [onLiveEvent, room.id, myId]);

  async function deliver(tempId: string, content: string) {
    try {
      await send.mutateAsync(content);
      setPending((list) => list.filter((p) => p.tempId !== tempId));
    } catch {
      setPending((list) =>
        list.map((p) => (p.tempId === tempId ? { ...p, status: "failed" } : p)),
      );
    }
  }

  function handleSend(content: string) {
    const tempId = crypto.randomUUID();
    setPending((list) => [...list, { tempId, content, status: "sending" }]);
    void deliver(tempId, content);
  }

  function handleRetry(tempId: string) {
    const item = pending.find((p) => p.tempId === tempId);
    if (!item) return;
    setPending((list) =>
      list.map((p) => (p.tempId === tempId ? { ...p, status: "sending" } : p)),
    );
    void deliver(tempId, item.content);
  }

  const status = room.exchangeStatus
    ? EXCHANGE_STATUS_CONFIG[room.exchangeStatus]
    : null;
  const subtitle = [
    room.bookTitle ? `Обмін «${room.bookTitle}»` : null,
    status?.label,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col"
      aria-label={`Розмова з ${room.otherUserName}`}
    >
      <header className="flex items-center gap-3 border-b border-border/70 px-2 py-3 sm:px-5.5 sm:py-4">
        <Link
          to="/chat"
          aria-label="До списку розмов"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
        >
          <IconChevronLeft className="size-6" />
        </Link>
        <UserLink
          userId={room.otherUserId}
          aria-label={`Профіль: ${room.otherUserName}`}
          className="shrink-0 rounded-full"
        >
          <UserAvatar
            name={room.otherUserName}
            src={room.otherUserAvatarUrl}
            className="h-11 w-11"
            fallbackClassName="font-sans text-base font-extrabold"
          />
        </UserLink>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">
            <UserLink
              userId={room.otherUserId}
              className="underline-offset-2 hover:underline"
            >
              {room.otherUserName}
            </UserLink>
          </p>
          <p className="truncate text-[13px] text-muted-foreground">
            {isTyping ? (
              <span className="font-semibold text-primary">друкує…</span>
            ) : (
              subtitle
            )}
          </p>
        </div>
        {room.exchangeId && (
          <Link
            to={`/exchanges/${room.exchangeId}`}
            className="flex h-10 shrink-0 items-center rounded-[10px] border border-input px-3.5 text-sm font-semibold hover:bg-muted"
          >
            До обміну
          </Link>
        )}
      </header>

      {messagesQuery.isPending ? (
        <div className="flex flex-1 items-center justify-center bg-[#FAF9F6]">
          <Spinner size={24} />
        </div>
      ) : messagesQuery.isError && !messagesQuery.data ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#FAF9F6] p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Не вдалося завантажити повідомлення.
          </p>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => messagesQuery.refetch()}
          >
            Спробувати ще раз
          </Button>
        </div>
      ) : (
        <MessageList
          messages={messages}
          pending={pending}
          myId={myId}
          hasOlder={!!messagesQuery.hasNextPage}
          isLoadingOlder={messagesQuery.isFetchingNextPage}
          onLoadOlder={() => messagesQuery.fetchNextPage()}
          onRetry={handleRetry}
          onDiscard={(tempId) =>
            setPending((list) => list.filter((p) => p.tempId !== tempId))
          }
        />
      )}

      <ChatComposer onSend={handleSend} onTyping={() => sendTyping(room.id)} />
    </section>
  );
}
