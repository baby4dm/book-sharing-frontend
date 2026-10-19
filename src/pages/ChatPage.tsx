import { useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconMessageCircle } from "@tabler/icons-react";
import { getChatRoomByExchange, getChatRoomWithUser } from "@/api/chats";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";

import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { cn } from "@/lib/utils";
import ChatList from "@/features/chats/components/ChatList";
import ChatThread from "@/features/chats/components/ChatThread";
import { useChatRooms } from "@/features/chats/hooks/useChats";
import type { ChatRoom } from "@/features/chats/types";
import { CHAT_ROOMS_KEY } from "@/features/chats/utils/chatCache";

export default function ChatPage() {
  const { roomId = null } = useParams();
  const [searchParams] = useSearchParams();
  const exchangeId = searchParams.get("exchange");
  const userId = searchParams.get("user");
  const target = exchangeId
    ? ({ kind: "exchange", id: exchangeId } as const)
    : userId
      ? ({ kind: "user", id: userId } as const)
      : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: me } = useCurrentUserProfile();
  const roomsQuery = useChatRooms();

  const resolveRoom = useQuery({
    queryKey: ["chatResolve", target?.kind, target?.id],
    queryFn: () =>
      target!.kind === "exchange"
        ? getChatRoomByExchange(target!.id)
        : getChatRoomWithUser(target!.id),
    enabled: !!target,
    gcTime: 0,
  });
  useEffect(() => {
    const room = resolveRoom.data;
    if (!room) return;
    queryClient.setQueryData<ChatRoom[]>(CHAT_ROOMS_KEY, (rooms) =>
      rooms && !rooms.some((r) => r.id === room.id) ? [room, ...rooms] : rooms,
    );
    navigate(`/chat/${room.id}`, { replace: true });
  }, [resolveRoom.data, queryClient, navigate]);

  const rooms = roomsQuery.data ?? [];
  const activeRoom = roomId
    ? rooms.find((room) => room.id === roomId)
    : undefined;

  const loading =
    roomsQuery.isPending || !me || (!!target && resolveRoom.isPending);

  return (
    <div className="mx-auto w-full max-w-295 md:px-6 md:py-6 xl:px-12">
      <div className="flex h-[calc(100dvh-60px)] overflow-hidden bg-card md:h-[calc(100dvh-60px-48px)] md:rounded-[20px] md:border md:border-border lg:h-[calc(100dvh-72px-48px)]">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size={28} />
          </div>
        ) : roomsQuery.isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-heading text-lg font-semibold">
              Не вдалося завантажити чати
            </p>
            <Button
              className="cursor-pointer"
              onClick={() => roomsQuery.refetch()}
            >
              Спробувати ще раз
            </Button>
          </div>
        ) : target && resolveRoom.isError ? (
          <NotFound
            text={getErrorMessage(
              resolveRoom.error,
              "Не вдалося відкрити розмову.",
            )}
          />
        ) : (
          <>
            <aside
              className={cn(
                "h-full w-full min-w-0 border-border/70 md:w-[320px] md:shrink-0 md:border-r lg:w-85",
                roomId ? "hidden md:block" : "block",
              )}
            >
              <ChatList rooms={rooms} activeRoomId={roomId} myId={me.id} />
            </aside>

            <div
              className={cn(
                "h-full min-w-0 flex-1",
                roomId ? "flex" : "hidden md:flex",
              )}
            >
              {activeRoom ? (
                <ChatThread
                  key={activeRoom.id}
                  room={activeRoom}
                  myId={me.id}
                />
              ) : roomId ? (
                <NotFound text="Розмову не знайдено або у вас немає до неї доступу." />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-[#FAF9F6] p-6 text-center">
                  <IconMessageCircle className="size-10 text-muted-foreground/50" />
                  <p className="font-semibold">Оберіть розмову</p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Тут ви домовляєтесь про передачу й повернення книги.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NotFound({ text }: { text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link
        to="/chat"
        className="text-sm font-bold text-primary hover:underline"
      >
        До списку розмов
      </Link>
    </div>
  );
}
