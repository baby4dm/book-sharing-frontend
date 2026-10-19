import type { ChatEvent } from "@/features/chats/types";
import { createContext, useContext } from "react";

export type LiveEventListener = (event: ChatEvent) => void;

export interface ChatSocketContextValue {
  connected: boolean;

  sendTyping: (roomId: string) => void;

  onLiveEvent: (listener: LiveEventListener) => () => void;

  setActiveRoom: (roomId: string | null) => void;
}

export const ChatSocketContext = createContext<ChatSocketContextValue | null>(
  null,
);

export function useChatSocket(): ChatSocketContextValue {
  const context = useContext(ChatSocketContext);
  if (!context) {
    throw new Error("useChatSocket must be used within ChatSocketProvider");
  }
  return context;
}
