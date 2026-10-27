export type NotificationType =
  | "NEW_REQUEST"
  | "REQUEST_APPROVED"
  | "REQUEST_REJECTED"
  | "HANDOVER_READY"
  | "SHIPMENT_ADDRESS_ADDED"
  | "BOOK_SHIPPED"
  | "BOOK_RECEIVED"
  | "RETURN_STARTED"
  | "EXCHANGE_COMPLETED"
  | "DEADLINE_SOON"
  | "DEADLINE_OVERDUE"
  | "EXTENSION_REQUESTED"
  | "EXTENSION_DECIDED"
  | "DISPUTE_FILED"
  | "DISPUTE_RESOLVED"
  | "NEW_CHAT_MESSAGE"
  | "NEW_COMMENT"
  | "REVIEW_RECEIVED"
  | "FEEDBACK_RECEIVED"
  | "LISTING_HIDDEN"
  | "LISTING_RESTORED"
  | "CONTENT_REMOVED"
  | "ACCOUNT_RESTRICTED"
  | "ACCOUNT_RESTORED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  referenceId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  link: string | null;
}

export interface NotificationPage {
  items: AppNotification[];
  hasMore: boolean;
}

export type NotificationEvent =
  | { kind: "CREATED"; notification: AppNotification; unreadCount: number }
  | { kind: "READ"; notificationId: string; unreadCount: number }
  | { kind: "READ_ALL"; unreadCount: number };
