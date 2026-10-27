import { useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertTriangle,
  IconMessageCircle,
  IconMessageOff,
} from "@tabler/icons-react";
import { getChatRoomByExchange, getChatRoomWithUser } from "@/api/chats";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
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
      <h1 className="sr-only">Чат</h1>
      <div
        className={cn(
          "flex overflow-hidden bg-card md:rounded-xl md:border md:border-border md:shadow-xs lg:h-[calc(100dvh-64px-48px)]",
          roomId
            ? "h-[calc(100dvh-56px)] md:h-[calc(100dvh-56px-48px)]"
            : "h-[calc(100dvh-56px-4rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-56px-4rem-48px)]",
        )}
      >
        {loading ? (
          <div aria-busy="true" className="flex flex-1">
            <div className="flex w-full flex-col gap-1 p-3 md:w-[320px] md:border-r md:border-border lg:w-85">
              <Skeleton className="mx-1 mb-3 h-7 w-16" />
              <Skeleton className="mx-1 mb-2 h-9" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-1 py-2">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2 pt-0.5">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden flex-1 bg-background md:block" />
          </div>
        ) : roomsQuery.isError ? (
          <EmptyState
            className="flex-1 justify-center"
            icon={IconAlertTriangle}
            title="Не вдалося завантажити чати"
            description="Перевірте з'єднання і спробуйте ще раз."
            action={
              <Button variant="outline" onClick={() => roomsQuery.refetch()}>
                Спробувати ще раз
              </Button>
            }
          />
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
                "h-full w-full min-w-0 border-border md:w-[320px] md:shrink-0 md:border-r lg:w-85",
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
                <EmptyState
                  className="flex-1 justify-center bg-background"
                  icon={IconMessageCircle}
                  title="Оберіть розмову"
                  description="Тут ви домовляєтесь про передачу й повернення книги."
                />
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
    <EmptyState
      className="flex-1 justify-center bg-background"
      icon={IconMessageOff}
      title="Розмову не знайдено"
      description={text}
      action={
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/chat" />}
        >
          До списку розмов
        </Button>
      }
    />
  );
}
