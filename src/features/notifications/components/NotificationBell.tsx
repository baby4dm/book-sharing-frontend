import { useState } from "react";
import { Link } from "react-router-dom";
import { IconBell, IconBellOff } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/Spinner";
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
  // дзвіночок «дзеленчить», коли непрочитаних стало більше (нове сповіщення)
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
          "relative flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-secondary data-popup-open:text-foreground lg:size-11",
          className,
        )}
      >
        <IconBell
          key={ringKey}
          className={cn("size-6 stroke-[1.6]", ringKey > 0 && "animate-bell-ring")}
        />
        {unread > 0 && (
          <span
            key={badge}
            aria-hidden="true"
            className="animate-badge-pop absolute top-1 right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-popover bg-destructive px-1 text-[10px] leading-none font-extrabold text-white"
          >
            {badge}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        aria-label="Сповіщення"
        className="w-[min(420px,calc(100vw-24px))] gap-0 overflow-hidden rounded-2xl p-0 shadow-[0_16px_40px_rgba(29,28,26,0.16)] ring-border"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4.5 py-3.5">
          <h2 className="text-base font-extrabold">Сповіщення</h2>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="h-9 cursor-pointer rounded-md px-1 text-sm font-bold text-accent-vivid hover:underline disabled:opacity-60"
            >
              Прочитати всі
            </button>
          )}
        </div>

        <div className="max-h-[min(480px,65dvh)] overflow-y-auto overscroll-contain">
          {feed.isPending && feed.fetchStatus !== "idle" ? (
            <div className="flex justify-center py-10">
              <Spinner size={22} />
            </div>
          ) : feed.isError ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Не вдалося завантажити сповіщення.{" "}
              <button
                type="button"
                onClick={() => feed.refetch()}
                className="cursor-pointer font-semibold text-accent-vivid hover:underline"
              >
                Спробувати ще
              </button>
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconBellOff className="size-6" stroke={1.7} />
              </span>
              <p className="font-semibold">Сповіщень поки немає</p>
              <p className="text-sm text-muted-foreground">
                Тут з'являться нові заявки, кроки обмінів і нагадування про
                терміни.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
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
          className="block border-t border-border/70 px-4.5 py-3.5 text-center text-sm font-bold text-accent-vivid hover:bg-muted/70"
        >
          Усі сповіщення
        </Link>
      </PopoverContent>
    </Popover>
  );
}
