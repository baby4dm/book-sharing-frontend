import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { IconBellOff, IconChecks } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import NotificationItem from "@/features/notifications/components/NotificationItem";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsFeed,
  useUnreadNotificationsCount,
} from "@/features/notifications/hooks/useNotifications";
import { useNow } from "@/features/notifications/hooks/useNow";
import type { AppNotification } from "@/features/notifications/types";
import { notificationGroup } from "@/features/notifications/utils/notificationMeta";

type Tab = "all" | "unread";

export default function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "unread" ? "unread" : "all";
  const now = useNow();

  const { data: unread = 0 } = useUnreadNotificationsCount();
  const feed = useNotificationsFeed(tab === "unread");
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const groups = useMemo(() => {
    const items = feed.data?.pages.flatMap((p) => p.items) ?? [];
    const result: { label: string; items: AppNotification[] }[] = [];
    for (const item of items) {
      const label = notificationGroup(item.createdAt, now);
      const last = result[result.length - 1];
      if (last && last.label === label) last.items.push(item);
      else result.push({ label, items: [item] });
    }
    return result;
  }, [feed.data, now]);

  function handleOpen(notification: AppNotification) {
    if (!notification.read) markRead.mutate(notification.id);
  }

  function selectTab(next: Tab) {
    setSearchParams(next === "all" ? {} : { tab: next }, { replace: true });
  }

  return (
    <div className="mx-auto flex w-full max-w-190 flex-col gap-5 px-4 pt-6 pb-16 md:px-6 md:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-[28px] leading-tight font-semibold md:text-4xl">
            Сповіщення
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            {unread > 0 ? `Непрочитаних: ${unread}` : "Усе прочитано"}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="h-11 cursor-pointer gap-2 rounded-[10px] px-4 text-sm font-semibold"
          >
            <IconChecks className="size-4.5" />
            Прочитати всі
          </Button>
        )}
      </header>

      <div
        role="tablist"
        aria-label="Фільтр сповіщень"
        className="flex w-full gap-1 rounded-xl bg-muted p-1.5 sm:w-fit"
      >
        {(
          [
            { value: "all", label: "Усі" },
            { value: "unread", label: "Непрочитані" },
          ] as const
        ).map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => selectTab(t.value)}
            className={cn(
              "flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors sm:flex-none",
              tab === t.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.value === "unread" && unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-extrabold text-white">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {feed.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : feed.isError ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <p className="font-semibold">Не вдалося завантажити сповіщення</p>
          <Button
            variant="outline"
            onClick={() => feed.refetch()}
            className="mt-4 h-11 cursor-pointer rounded-[10px]"
          >
            Спробувати ще
          </Button>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconBellOff className="size-7" stroke={1.7} />
          </span>
          <p className="mt-1 text-lg font-bold">
            {tab === "unread" ? "Непрочитаних немає" : "Сповіщень поки немає"}
          </p>
          <p className="max-w-90 text-[15px] text-muted-foreground">
            {tab === "unread"
              ? "Ви все переглянули. Нові події з'являться тут і на дзвіночку в шапці."
              : "Тут з'являться нові заявки, кроки обмінів, нагадування про терміни й відгуки."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <section
              key={group.label}
              aria-label={group.label}
              className="flex flex-col gap-2"
            >
              <h2 className="px-1 text-[13px] font-extrabold tracking-[0.06em] text-muted-foreground uppercase">
                {group.label}
              </h2>
              <ul className="stagger-in divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card">
                {group.items.map((n) => (
                  <li key={n.id}>
                    <NotificationItem
                      notification={n}
                      now={now}
                      onOpen={handleOpen}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {feed.hasNextPage && (
            <Button
              variant="outline"
              onClick={() => feed.fetchNextPage()}
              disabled={feed.isFetchingNextPage}
              className="h-11 cursor-pointer self-center rounded-[10px] px-6"
            >
              {feed.isFetchingNextPage ? "Завантаження..." : "Показати ще"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
