import type {
  ChatMessage,
  ChatMessagePage,
  ChatRoom,
} from "@/features/chats/types";
import apiClient from "./client";

export async function getChatRooms(): Promise<ChatRoom[]> {
  const response = await apiClient.get<ChatRoom[]>("/api/chats");
  return response.data;
}

export async function getChatRoomByExchange(
  exchangeId: string,
): Promise<ChatRoom> {
  const response = await apiClient.get<ChatRoom>(
    `/api/chats/by-exchange/${exchangeId}`,
  );
  return response.data;
}

export async function getChatRoomWithUser(userId: string): Promise<ChatRoom> {
  const response = await apiClient.get<ChatRoom>(`/api/chats/with/${userId}`);
  return response.data;
}

export async function getUnreadChatsCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>(
    "/api/chats/unread-count",
  );
  return response.data.count;
}

export async function getChatMessages(
  roomId: string,
  before: string | null,
): Promise<ChatMessagePage> {
  const response = await apiClient.get<ChatMessagePage>(
    `/api/chats/${roomId}/messages`,
    { params: { size: 30, ...(before ? { before } : {}) } },
  );
  return response.data;
}

export async function sendChatMessage(
  roomId: string,
  content: string,
): Promise<ChatMessage> {
  const response = await apiClient.post<ChatMessage>(
    `/api/chats/${roomId}/messages`,
    { content },
  );
  return response.data;
}

export async function markChatAsRead(roomId: string): Promise<void> {
  await apiClient.post(`/api/chats/${roomId}/read`);
}

export function getChatSocketUrl(): string {
  const base = apiClient.defaults.baseURL ?? window.location.origin;
  return base.replace(/^http/, "ws").replace(/\/$/, "") + "/ws";
}
