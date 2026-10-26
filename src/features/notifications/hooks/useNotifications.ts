import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/notifications";
import { useAuth } from "@/context/AuthContext";
import {
  notificationsListKey,
  NOTIFICATIONS_UNREAD_KEY,
  markReadInCache,
  setUnreadCount,
  markAllReadInCache,
} from "../utils/notificationCache";

export function useNotificationsFeed(unreadOnly = false, enabled = true) {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: notificationsListKey(unreadOnly),
    queryFn: ({ pageParam }) =>
      getNotifications({ before: pageParam, unreadOnly }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.items.length > 0
        ? lastPage.items[lastPage.items.length - 1].createdAt
        : undefined,
    enabled: isAuthenticated && enabled,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationsCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_KEY,
    queryFn: getUnreadNotificationsCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: (id) => {
      markReadInCache(queryClient, id);
      const count = queryClient.getQueryData<number>(NOTIFICATIONS_UNREAD_KEY);
      if (count !== undefined) setUnreadCount(queryClient, count - 1);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_KEY }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => {
      markAllReadInCache(queryClient);
      setUnreadCount(queryClient, 0);
    },
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
