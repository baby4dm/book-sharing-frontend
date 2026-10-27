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
          "flex size-5 shrink-0 items-center justify-center pt-0.5",
          toneClass,
        )}
      >
        <Icon className="size-4.5" stroke={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            "text-sm leading-[1.45] wrap-break-word",
            unread ? "font-semibold text-foreground" : "text-muted-foreground",
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
          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
        />
      )}
    </>
  );

  const rowClass = cn(
    "flex w-full gap-3 px-4 py-3.5 text-left transition-colors duration-150 outline-none hover:bg-muted focus-visible:bg-muted focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]",
    unread && "bg-accent/40 hover:bg-accent/70",
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
