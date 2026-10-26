import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { getChatSocketUrl, markChatAsRead } from "@/api/chats";
import { useAuth } from "@/context/AuthContext";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import type { NotificationEvent } from "@/features/notifications/types";
import {
  applyNotificationEvent,
  NOTIFICATIONS_KEY,
} from "@/features/notifications/utils/notificationCache";
import type { ChatEvent } from "@/features/chats/types";
import {
  appendMessage,
  applyMessageToRooms,
  CHAT_ROOMS_KEY,
  CHAT_UNREAD_KEY,
  updateRoom,
  markMyMessagesRead,
} from "@/features/chats/utils/chatCache";
import {
  ChatSocketContext,
  type LiveEventListener,
} from "@/context/ChatSocketContext";

const TYPING_THROTTLE_MS = 3000;

export default function ChatSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token, isAuthenticated } = useAuth();
  const { data: me } = useCurrentUserProfile();
  const myId = me?.id ?? null;
  const queryClient = useQueryClient();

  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const activeRoomRef = useRef<string | null>(null);
  const liveListenersRef = useRef(new Set<LiveEventListener>());
  const lastTypingSentRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (!isAuthenticated || !token || !myId) return;

    let hadConnection = false;

    const handleEvent = (event: ChatEvent) => {
      liveListenersRef.current.forEach((listener) => listener(event));
      switch (event.type) {
        case "MESSAGE": {
          const message = event.message;
          const mine = message.senderId === myId;
          const isActive = activeRoomRef.current === message.chatRoomId;
          const visible = document.visibilityState === "visible";

          appendMessage(queryClient, message);
          const countAsUnread = !mine && !(isActive && visible);
          const found = applyMessageToRooms(
            queryClient,
            message,
            countAsUnread,
          );
          if (!found) {
            queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_KEY });
          }
          if (!mine && isActive && visible) {
            markChatAsRead(message.chatRoomId).catch(() => undefined);
          } else if (!mine) {
            queryClient.invalidateQueries({ queryKey: CHAT_UNREAD_KEY });
          }
          break;
        }
        case "READ": {
          if (event.userId === myId) {
            updateRoom(queryClient, event.chatRoomId, (room) => ({
              ...room,
              unreadCount: 0,
            }));
            queryClient.invalidateQueries({ queryKey: CHAT_UNREAD_KEY });
          } else {
            markMyMessagesRead(
              queryClient,
              event.chatRoomId,
              myId,
              event.readAt,
            );
          }
          break;
        }
        case "TYPING":
          break;
      }
    };

    const client = new Client({
      brokerURL: getChatSocketUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/user/queue/chat", (frame) => {
          try {
            handleEvent(JSON.parse(frame.body) as ChatEvent);
          } catch {
            //
          }
        });
        client.subscribe("/user/queue/notifications", (frame) => {
          try {
            applyNotificationEvent(
              queryClient,
              JSON.parse(frame.body) as NotificationEvent,
            );
          } catch {
            //
          }
        });
        if (hadConnection) {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
          queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_KEY });
          queryClient.invalidateQueries({ queryKey: CHAT_UNREAD_KEY });
          queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
        }
        hadConnection = true;
      },
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      clientRef.current = null;
      setConnected(false);
      client.deactivate();
    };
  }, [isAuthenticated, token, myId, queryClient]);

  const sendTyping = useCallback((roomId: string) => {
    const client = clientRef.current;
    if (!client?.connected) return;
    const now = Date.now();
    const last = lastTypingSentRef.current.get(roomId) ?? 0;
    if (now - last < TYPING_THROTTLE_MS) return;
    lastTypingSentRef.current.set(roomId, now);
    client.publish({ destination: `/app/chat/${roomId}/typing`, body: "" });
  }, []);

  const onLiveEvent = useCallback((listener: LiveEventListener) => {
    liveListenersRef.current.add(listener);
    return () => {
      liveListenersRef.current.delete(listener);
    };
  }, []);

  const setActiveRoom = useCallback((roomId: string | null) => {
    activeRoomRef.current = roomId;
  }, []);

  const value = useMemo(
    () => ({ connected, sendTyping, onLiveEvent, setActiveRoom }),
    [connected, sendTyping, onLiveEvent, setActiveRoom],
  );

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
}
