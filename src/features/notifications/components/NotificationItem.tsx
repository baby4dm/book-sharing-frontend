import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AppNotification } from "../types";
import {
  formatNotificationTime,
  getNotificationMeta,
} from "../utils/notificationMeta";

interface NotificationItemProps {
  notification: AppNotification;
  now: Date;
  onOpen: (notification: AppNotification) => void;
  className?: string;
}

export default function NotificationItem({
  notification,
  now,
  onOpen,
  className,
}: NotificationItemProps) {
  const { Icon, className: toneClass } = getNotificationMeta(notification.type);
  const unread = !notification.read;

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          toneClass,
        )}
      >
        <Icon className="size-4.5" stroke={2} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            "text-sm leading-[1.45] wrap-break-word",
            unread ? "font-semibold text-foreground" : "text-foreground/75",
          )}
        >
          {notification.message}
        </span>
        <time
          dateTime={notification.createdAt}
          className="text-xs text-muted-foreground"
        >
          {formatNotificationTime(notification.createdAt, now)}
        </time>
      </span>
      {unread && (
        <span
          aria-label="Непрочитане"
          className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-vivid"
        />
      )}
    </>
  );

  const rowClass = cn(
    "flex w-full gap-3 px-[18px] py-3.5 text-left transition-colors outline-none focus-visible:bg-muted hover:bg-muted/70",
    unread && "bg-accent/45",
    className,
  );

  if (notification.link) {
    return (
      <Link
        to={notification.link}
        onClick={() => onOpen(notification)}
        className={rowClass}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={cn(rowClass, "cursor-pointer")}
    >
      {content}
    </button>
  );
}
