import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getChatMessages,
  getChatRooms,
  getUnreadChatsCount,
  markChatAsRead,
  sendChatMessage,
} from "@/api/chats";
import { useAuth } from "@/context/AuthContext";
import {
  appendMessage,
  applyMessageToRooms,
  CHAT_ROOMS_KEY,
  CHAT_UNREAD_KEY,
  chatMessagesKey,
  updateRoom,
} from "../utils/chatCache";

export function useChatRooms() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: CHAT_ROOMS_KEY,
    queryFn: getChatRooms,
    enabled: isAuthenticated,
  });
}

export function useUnreadChatsCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: CHAT_UNREAD_KEY,
    queryFn: getUnreadChatsCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}

export function useChatMessages(roomId: string) {
  return useInfiniteQuery({
    queryKey: chatMessagesKey(roomId),
    queryFn: ({ pageParam }) => getChatMessages(roomId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.items.length > 0
        ? lastPage.items[0].createdAt
        : undefined,
    staleTime: Infinity,
  });
}

export function useSendChatMessage(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendChatMessage(roomId, content),
    onSuccess: (message) => {
      appendMessage(queryClient, message);
      applyMessageToRooms(queryClient, message, false);
    },
  });
}

export function useMarkChatAsRead(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markChatAsRead(roomId),
    onSuccess: () => {
      updateRoom(queryClient, roomId, (room) => ({ ...room, unreadCount: 0 }));
      queryClient.invalidateQueries({ queryKey: CHAT_UNREAD_KEY });
    },
  });
}
