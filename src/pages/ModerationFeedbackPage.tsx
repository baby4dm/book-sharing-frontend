import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconMail,
  IconMailOpened,
  IconPhoto,
} from "@tabler/icons-react";
import EmptyState from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import {
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TOPIC_LABELS,
  type FeedbackResponse,
  type FeedbackStatus,
  type FeedbackTopic,
} from "@/features/feedback/types";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { cn, formatRelativeTime } from "@/lib/utils";
import UserLink from "@/features/userProfile/components/UserLink";
import {
  useFeedbackList,
  useUpdateFeedback,
} from "@/features/feedback/hooks/useFeeback";
import SmartImage from "@/components/ui/SmartImage";

const STATUSES: FeedbackStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED"];
const TOPICS: FeedbackTopic[] = ["QUESTION", "BUG", "IDEA", "COMPLAINT"];

const TOPIC_TONE: Record<FeedbackTopic, string> = {
  QUESTION: "bg-info/10 text-info",
  BUG: "bg-warning/10 text-warning",
  IDEA: "bg-accent text-accent-foreground",
  COMPLAINT: "bg-destructive/10 text-destructive",
};

const STATUS_ACTIONS: { value: FeedbackStatus; label: string }[] = [
  { value: "NEW", label: "Нове" },
  { value: "IN_PROGRESS", label: "В роботі" },
  { value: "RESOLVED", label: "Вирішено" },
];

function isSafeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Звернення з форми зворотного зв'язку. {@code embedded} — вкладка панелі
 * модерації (без власного заголовка й перевірки доступу: її робить ModeratorRoute).
 */
export default function ModerationFeedbackPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { data: me, isPending: isMePending } = useCurrentUserProfile();
  const [status, setStatus] = useState<FeedbackStatus | null>("NEW");
  const [topic, setTopic] = useState<FeedbackTopic | null>(null);
  const [page, setPage] = useState(0);

  const isModerator = me?.role === "MODERATOR" || me?.role === "ADMIN";
  const { data, isPending, isError, refetch, isPlaceholderData } =
    useFeedbackList({ status, topic, page }, isModerator);

  if (isMePending && !embedded) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} />
      </div>
    );
  }
  if (!isModerator && !embedded) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
        <p className="text-lg font-bold">Немає доступу</p>
        <p className="text-sm text-muted-foreground">
          Ця сторінка доступна лише модераторам.
        </p>
        <Link to="/" className="text-sm font-bold text-primary hover:underline">
          На головну
        </Link>
      </div>
    );
  }

  const counts = data?.statusCounts;
  const total = counts ? STATUSES.reduce((sum, s) => sum + counts[s], 0) : null;

  const tabClass = (active: boolean) =>
    cn(
      "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-[13px] font-medium transition-[background-color,border-color,color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      active
        ? "border-ring/40 bg-accent font-semibold text-accent-foreground"
        : "border-input bg-card text-foreground shadow-xs hover:border-border-strong hover:bg-muted",
    );

  return (
    <section
      className={
        embedded
          ? "flex w-full flex-col gap-4"
          : "mx-auto flex w-full max-w-250 flex-col gap-5 px-4 pt-6 pb-16 md:px-8 md:pt-8"
      }
    >
      {embedded ? (
        <p className="text-[13px] text-muted-foreground">
          Повідомлення з форми зворотного зв'язку. Відповідайте на email автора,
          а тут позначайте статус.
        </p>
      ) : (
        <div>
          <h1 className="page-title">Звернення</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            Повідомлення з форми зворотного зв'язку. Відповідайте на email
            автора, а тут позначайте статус.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Статус">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={status === s}
            onClick={() => {
              setStatus(s);
              setPage(0);
            }}
            className={tabClass(status === s)}
          >
            {FEEDBACK_STATUS_LABELS[s]}
            {counts && (
              <span className="tabular text-muted-foreground">{counts[s]}</span>
            )}
          </button>
        ))}
        <button
          type="button"
          role="tab"
          aria-selected={status === null}
          onClick={() => {
            setStatus(null);
            setPage(0);
          }}
          className={tabClass(status === null)}
        >
          Усі
          {total !== null && (
            <span className="tabular text-muted-foreground">{total}</span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">
          Тема:
        </span>
        {[null, ...TOPICS].map((t) => (
          <button
            key={t ?? "all"}
            type="button"
            aria-pressed={topic === t}
            onClick={() => {
              setTopic(t);
              setPage(0);
            }}
            className={cn(
              "h-7 cursor-pointer rounded-md border px-2 text-xs font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              topic === t
                ? "border-ring/40 bg-accent font-semibold text-accent-foreground"
                : "border-input bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t ? FEEDBACK_TOPIC_LABELS[t] : "Усі"}
          </button>
        ))}
      </div>

      {isPending ? (
        <div aria-busy="true" className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface flex flex-col gap-3 p-5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          ))}
        </div>
      ) : isError || !data ? (
        <div className="flex flex-col items-center gap-3 surface p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Не вдалося завантажити звернення.
          </p>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => refetch()}
          >
            Спробувати ще раз
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          framed
          icon={IconMailOpened}
          title={
            status === "NEW"
              ? "Нових звернень немає"
              : "Звернень з такими фільтрами немає"
          }
          description="Звернення приходять із форми «Зворотний зв'язок» у футері сайту."
        />
      ) : (
        <ul
          className={cn(
            "flex flex-col gap-3",
            isPlaceholderData && "opacity-60",
          )}
        >
          {data.items.map((item) => (
            <li key={item.id}>
              <FeedbackCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Попередня сторінка"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="cursor-pointer"
          >
            <IconChevronLeft />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} з {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Наступна сторінка"
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="cursor-pointer"
          >
            <IconChevronRight />
          </Button>
        </div>
      )}
    </section>
  );
}

function FeedbackCard({ item }: { item: FeedbackResponse }) {
  const update = useUpdateFeedback();
  const [note, setNote] = useState(item.moderatorNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const noteChanged = note.trim() !== (item.moderatorNote ?? "");

  function save(payload: { status?: FeedbackStatus; moderatorNote?: string }) {
    setError(null);
    update.mutate(
      { id: item.id, payload },
      {
        onError: (err) => setError(getErrorMessage(err, "Не вдалося зберегти")),
      },
    );
  }

  const mailSubject = encodeURIComponent(
    `Ваше звернення на bookshare: ${FEEDBACK_TOPIC_LABELS[item.topic].toLowerCase()}`,
  );

  return (
    <article className="flex flex-col gap-4 surface p-5">
      <header className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold",
            TOPIC_TONE[item.topic],
          )}
        >
          {FEEDBACK_TOPIC_LABELS[item.topic]}
        </span>
        <div className="flex min-w-0 items-center gap-2">
          {item.userName && item.userId ? (
            <UserLink
              userId={item.userId}
              className="flex min-w-0 items-center gap-2"
            >
              <UserAvatar
                name={item.userName}
                seed={item.userId}
                src={item.userAvatarUrl}
                className="size-7"
                fallbackClassName="font-sans text-xs font-bold"
              />
              <span className="truncate text-sm font-bold underline-offset-2 group-hover:underline">
                {item.userName}
              </span>
            </UserLink>
          ) : (
            <span className="text-sm font-bold text-muted-foreground">
              Гість
            </span>
          )}
          <span className="truncate text-sm text-muted-foreground">
            · {item.email}
          </span>
        </div>
        <time
          dateTime={item.createdAt}
          className="ml-auto text-[13px] text-muted-foreground"
        >
          {formatRelativeTime(item.createdAt)}
        </time>
      </header>

      <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-line">
        {item.message}
      </p>

      {(item.link || item.screenshotUrl) && (
        <div className="flex flex-wrap items-center gap-3">
          {item.link && !isSafeUrl(item.link) && (
            <span className="max-w-full truncate text-sm text-muted-foreground">
              Посилання: {item.link}
            </span>
          )}
          {item.link && isSafeUrl(item.link) && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <IconExternalLink className="size-4 shrink-0" />
              <span className="truncate">{item.link}</span>
            </a>
          )}
          {item.screenshotUrl && (
            <a
              href={item.screenshotUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border p-1 pr-3 text-sm font-semibold hover:bg-muted"
            >
              <SmartImage
                src={item.screenshotUrl}
                alt="Скріншот до звернення"
                className="h-10 w-14 rounded object-cover"
              />
              <IconPhoto className="size-4 text-primary" />
              Скріншот
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-xl bg-background p-3.5">
        <label
          htmlFor={`note-${item.id}`}
          className="text-[13px] font-semibold text-muted-foreground"
        >
          Нотатка модератора (автор її не бачить)
        </label>
        <textarea
          id={`note-${item.id}`}
          rows={2}
          value={note}
          maxLength={2000}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Що зроблено, кому передано…"
          className="resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
        />
        {item.handledByName && (
          <span className="text-xs text-muted-foreground">
            Востаннє змінював(-ла): {item.handledByName}
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <footer className="flex flex-wrap items-center gap-2">
        <div
          className="flex gap-1 rounded-xl bg-secondary p-1"
          role="group"
          aria-label="Статус"
        >
          {STATUS_ACTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={item.status === s.value}
              disabled={update.isPending}
              onClick={() =>
                item.status !== s.value && save({ status: s.value })
              }
              className={cn(
                "h-9 cursor-pointer rounded-[9px] px-3 text-sm transition-colors disabled:cursor-wait",
                item.status === s.value
                  ? "bg-card font-bold shadow-sm"
                  : "font-semibold text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {noteChanged && (
          <Button
            size="sm"
            className="h-9 cursor-pointer rounded-lg"
            disabled={update.isPending}
            onClick={() => save({ moderatorNote: note.trim() })}
          >
            Зберегти нотатку
          </Button>
        )}
        <a
          href={`mailto:${item.email}?subject=${mailSubject}`}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-muted"
        >
          <IconMail className="size-4 text-primary" />
          Відповісти на email
        </a>
      </footer>
    </article>
  );
}
