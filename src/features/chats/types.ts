import type { ExchangeStatus } from "@/features/exchanges/types";

export interface ChatRoom {
  id: string;
  exchangeId: string | null;
  exchangeStatus: ExchangeStatus | null;
  bookTitle: string | null;
  bookCoverUrl: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface ChatMessagePage {
  items: ChatMessage[];
  hasMore: boolean;
}

export type ChatEvent =
  | {
      type: "MESSAGE";
      chatRoomId: string;
      message: ChatMessage;
      userId: string;
      readAt: null;
    }
  | {
      type: "READ";
      chatRoomId: string;
      message: null;
      userId: string;
      readAt: string;
    }
  | {
      type: "TYPING";
      chatRoomId: string;
      message: null;
      userId: string;
      readAt: null;
    };

export interface PendingMessage {
  tempId: string;
  content: string;
  status: "sending" | "failed";
}

export const MESSAGE_MAX_LENGTH = 4000;
