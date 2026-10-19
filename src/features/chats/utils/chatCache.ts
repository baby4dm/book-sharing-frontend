import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { ChatMessage, ChatMessagePage, ChatRoom } from "../types";

export const CHAT_ROOMS_KEY = ["chatRooms"] as const;
export const CHAT_UNREAD_KEY = ["chatUnread"] as const;
export const chatMessagesKey = (roomId: string) =>
  ["chatMessages", roomId] as const;

type MessagesData = InfiniteData<ChatMessagePage>;

export function flattenMessages(data: MessagesData | undefined): ChatMessage[] {
  if (!data) return [];
  const seen = new Set<string>();
  const result: ChatMessage[] = [];
  for (let i = data.pages.length - 1; i >= 0; i--) {
    for (const message of data.pages[i].items) {
      if (!seen.has(message.id)) {
        seen.add(message.id);
        result.push(message);
      }
    }
  }
  return result;
}

export function appendMessage(queryClient: QueryClient, message: ChatMessage) {
  queryClient.setQueryData<MessagesData>(
    chatMessagesKey(message.chatRoomId),
    (data) => {
      if (!data || data.pages.length === 0) return data;
      const exists = data.pages.some((page) =>
        page.items.some((m) => m.id === message.id),
      );
      if (exists) return data;
      const [newest, ...older] = data.pages;
      return {
        ...data,
        pages: [{ ...newest, items: [...newest.items, message] }, ...older],
      };
    },
  );
}

export function markMyMessagesRead(
  queryClient: QueryClient,
  roomId: string,
  myId: string,
  readAt: string,
) {
  queryClient.setQueryData<MessagesData>(chatMessagesKey(roomId), (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((m) =>
              m.senderId === myId && !m.readAt ? { ...m, readAt } : m,
            ),
          })),
        }
      : data,
  );
}

export function updateRoom(
  queryClient: QueryClient,
  roomId: string,
  update: (room: ChatRoom) => ChatRoom,
) {
  queryClient.setQueryData<ChatRoom[]>(CHAT_ROOMS_KEY, (rooms) =>
    rooms?.map((room) => (room.id === roomId ? update(room) : room)),
  );
}

export function applyMessageToRooms(
  queryClient: QueryClient,
  message: ChatMessage,
  incrementUnread: boolean,
): boolean {
  let found = false;
  queryClient.setQueryData<ChatRoom[]>(CHAT_ROOMS_KEY, (rooms) => {
    if (!rooms) return rooms;
    const room = rooms.find((r) => r.id === message.chatRoomId);
    if (!room) return rooms;
    found = true;
    const updated: ChatRoom = {
      ...room,
      lastMessage: message.content,
      lastMessageAt: message.createdAt,
      lastMessageSenderId: message.senderId,
      unreadCount: incrementUnread ? room.unreadCount + 1 : room.unreadCount,
    };
    return [updated, ...rooms.filter((r) => r.id !== room.id)];
  });
  return found;
}
