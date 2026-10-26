import type {
  NotificationPage,
  AppNotification,
  NotificationEvent,
} from "@/features/notifications/types";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";

export const NOTIFICATIONS_KEY = ["notifications"] as const;
export const NOTIFICATIONS_UNREAD_KEY = [
  "notifications",
  "unread-count",
] as const;

export function notificationsListKey(unreadOnly: boolean) {
  return ["notifications", "list", { unreadOnly }] as const;
}

type FeedData = InfiniteData<NotificationPage, string | null>;

function updateLists(
  queryClient: QueryClient,
  update: (data: FeedData, unreadOnly: boolean) => FeedData,
) {
  for (const unreadOnly of [false, true]) {
    queryClient.setQueryData<FeedData>(
      notificationsListKey(unreadOnly),
      (data) => (data ? update(data, unreadOnly) : data),
    );
  }
}

function mapItems(
  data: FeedData,
  fn: (n: AppNotification) => AppNotification,
): FeedData {
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, items: page.items.map(fn) })),
  };
}

export function prependNotification(
  queryClient: QueryClient,
  notification: AppNotification,
) {
  updateLists(queryClient, (data) => {
    const exists = data.pages.some((p) =>
      p.items.some((n) => n.id === notification.id),
    );
    if (exists || data.pages.length === 0) return data;
    const [first, ...rest] = data.pages;
    return {
      ...data,
      pages: [{ ...first, items: [notification, ...first.items] }, ...rest],
    };
  });
}

export function markReadInCache(queryClient: QueryClient, id: string) {
  updateLists(queryClient, (data) =>
    mapItems(data, (n) => (n.id === id && !n.read ? { ...n, read: true } : n)),
  );
}

export function markAllReadInCache(queryClient: QueryClient) {
  updateLists(queryClient, (data) =>
    mapItems(data, (n) => (n.read ? n : { ...n, read: true })),
  );
}

export function setUnreadCount(queryClient: QueryClient, count: number) {
  queryClient.setQueryData<number>(
    NOTIFICATIONS_UNREAD_KEY,
    Math.max(0, count),
  );
}

export function applyNotificationEvent(
  queryClient: QueryClient,
  event: NotificationEvent,
) {
  switch (event.kind) {
    case "CREATED":
      prependNotification(queryClient, event.notification);
      setUnreadCount(queryClient, event.unreadCount);
      break;
    case "READ":
      markReadInCache(queryClient, event.notificationId);
      setUnreadCount(queryClient, event.unreadCount);
      break;
    case "READ_ALL":
      markAllReadInCache(queryClient);
      setUnreadCount(queryClient, 0);
      break;
  }
}
