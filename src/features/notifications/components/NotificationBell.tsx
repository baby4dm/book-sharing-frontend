import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import { useState } from "react";
import { Link } from "react-router-dom";
import { IconBell, IconBellOff } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsFeed,
  useUnreadNotificationsCount,
} from "../hooks/useNotifications";
import { useNow } from "../hooks/useNow";
import type { AppNotification } from "../types";
import NotificationItem from "./NotificationItem";

const PREVIEW_LIMIT = 6;

export default function NotificationBell({
  className,
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const now = useNow();
  const { data: unread = 0 } = useUnreadNotificationsCount();
  const [prevUnread, setPrevUnread] = useState(unread);
  const [ringKey, setRingKey] = useState(0);
  if (unread !== prevUnread) {
    setPrevUnread(unread);
    if (unread > prevUnread) setRingKey((k) => k + 1);
  }
  const feed = useNotificationsFeed(false, open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = feed.data?.pages[0]?.items.slice(0, PREVIEW_LIMIT) ?? [];

  function handleOpenItem(notification: AppNotification) {
    if (!notification.read) markRead.mutate(notification.id);
    setOpen(false);
  }

  const badge = unread > 99 ? "99+" : String(unread);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={
          unread > 0 ? `Сповіщення: ${unread} непрочитаних` : "Сповіщення"
        }
        className={cn(
          "relative flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out outline-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 data-popup-open:bg-muted data-popup-open:text-foreground",
          className,
        )}
      >
        <IconBell
          key={ringKey}
          className={cn(
            "size-5 stroke-[1.75]",
            ringKey > 0 && "animate-bell-ring",
          )}
        />
        {unread > 0 && (
          <span
            key={badge}
            aria-hidden="true"
            className="animate-badge-pop tabular absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-white shadow-[0_0_0_2px_var(--card)]"
          >
            {badge}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        aria-label="Сповіщення"
        className="w-[min(400px,calc(100vw-24px))] gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="section-title">Сповіщення</h2>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="-mr-1.5 h-8 cursor-pointer rounded-md px-2 text-[13px] font-semibold text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Прочитати всі
            </button>
          )}
        </div>

        <div className="max-h-[min(480px,65dvh)] overflow-y-auto overscroll-contain">
          {feed.isPending && feed.fetchStatus !== "idle" ? (
            <ul aria-busy="true" className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex gap-3 px-4 py-3.5">
                  <Skeleton className="size-5 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3.5 w-4/5" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </li>
              ))}
            </ul>
          ) : feed.isError ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Не вдалося завантажити сповіщення.{" "}
              <button
                type="button"
                onClick={() => feed.refetch()}
                className="cursor-pointer font-semibold text-primary hover:underline"
              >
                Спробувати ще
              </button>
            </p>
          ) : items.length === 0 ? (
            <EmptyState
              icon={IconBellOff}
              title="Тут поки тихо"
              description="Нові заявки, кроки обмінів і нагадування про терміни з'являться тут."
              className="py-10"
            />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => (
                <li key={n.id}>
                  <NotificationItem
                    notification={n}
                    now={now}
                    onOpen={handleOpenItem}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          to="/notifications"
          onClick={() => setOpen(false)}
          className="block border-t border-border px-4 py-3 text-center text-[13px] font-semibold text-primary transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
        >
          Усі сповіщення
        </Link>
      </PopoverContent>
    </Popover>
  );
}
