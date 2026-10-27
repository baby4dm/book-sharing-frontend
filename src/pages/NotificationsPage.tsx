import SegmentedControl from "@/components/ui/segmented";
import EmptyState from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence } from "motion/react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  IconAlertTriangle,
  IconBellOff,
  IconChecks,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
import Collapse from "@/components/ui/collapse";

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
    <div className="mx-auto flex w-full max-w-190 flex-col gap-5 px-4 pt-6 pb-16 md:px-6 lg:pt-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Сповіщення</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `Непрочитаних: ${unread}` : "Усе прочитано"}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <IconChecks />
            Прочитати всі
          </Button>
        )}
      </header>

      <SegmentedControl
        aria-label="Фільтр сповіщень"
        className="w-full sm:w-auto sm:self-start"
        value={tab}
        onChange={selectTab}
        options={[
          { value: "all", label: "Усі" },
          {
            value: "unread",
            label: (
              <>
                Непрочитані
                {unread > 0 && (
                  <span className="tabular flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </>
            ),
          },
        ]}
      />

      {feed.isPending ? (
        <div aria-busy="true" className="flex flex-col gap-2">
          <Skeleton className="h-5 w-20" />
          <ul className="surface divide-y divide-border overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex gap-3 px-4 py-3.5">
                <Skeleton className="size-5 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-4/5" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : feed.isError ? (
        <EmptyState
          framed
          icon={IconAlertTriangle}
          title="Не вдалося завантажити сповіщення"
          description="Перевірте з'єднання і спробуйте ще раз."
          action={
            <Button variant="outline" onClick={() => feed.refetch()}>
              Спробувати ще раз
            </Button>
          }
        />
      ) : groups.length === 0 ? (
        <EmptyState
          framed
          icon={tab === "unread" ? IconChecks : IconBellOff}
          title={tab === "unread" ? "Усе прочитано" : "Тут поки тихо"}
          description={
            tab === "unread"
              ? "Нові події з'являться тут і на дзвіночку в шапці."
              : "Нові заявки, кроки обмінів, нагадування про терміни й відгуки з'являться тут."
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <section
              key={group.label}
              aria-label={group.label}
              className="flex flex-col gap-2"
            >
              <h2 className="section-title px-1">{group.label}</h2>
              <ul className="surface divide-y divide-border overflow-hidden">
                <AnimatePresence initial={false}>
                  {group.items.map((n) => (
                    <Collapse as="li" key={n.id}>
                      <NotificationItem
                        notification={n}
                        now={now}
                        onOpen={handleOpen}
                      />
                    </Collapse>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ))}

          {feed.hasNextPage && (
            <Button
              variant="outline"
              onClick={() => feed.fetchNextPage()}
              disabled={feed.isFetchingNextPage}
              className="self-center"
            >
              {feed.isFetchingNextPage ? "Завантаження..." : "Показати ще"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
