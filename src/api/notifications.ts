import type { NotificationPage } from "@/features/notifications/types";
import apiClient from "./client";

export const NOTIFICATIONS_PAGE_SIZE = 20;

export async function getNotifications(params: {
  before: string | null;
  unreadOnly: boolean;
}): Promise<NotificationPage> {
  const response = await apiClient.get<NotificationPage>("/api/notifications", {
    params: {
      size: NOTIFICATIONS_PAGE_SIZE,
      ...(params.unreadOnly ? { unreadOnly: true } : {}),
      ...(params.before ? { before: params.before } : {}),
    },
  });
  return response.data;
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>(
    "/api/notifications/unread-count",
  );
  return response.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/api/notifications/read-all");
}
