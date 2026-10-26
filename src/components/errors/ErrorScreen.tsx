import { useContext, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBookOff,
  IconHome,
  IconLock,
  IconRefresh,
  IconServerOff,
  IconSparkles,
  IconWifiOff,
  type Icon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { describeError, type ErrorKind } from "@/lib/errors";
import { FeedbackDialogContext } from "@/context/FeedbackDialogContext";

const CONTENT: Record<
  ErrorKind,
  { icon: Icon; code: string | null; title: string; text: string; tone: string }
> = {
  "not-found": {
    icon: IconBookOff,
    code: "404",
    title: "Сторінку не знайдено",
    text: "Можливо, посилання застаріло, запис видалили або в адресі помилка.",
    tone: "bg-accent text-accent-vivid",
  },
  forbidden: {
    icon: IconLock,
    code: "403",
    title: "Немає доступу",
    text: "Ця сторінка доступна лише учасникам або модераторам. Перевірте, чи ви увійшли в потрібний акаунт.",
    tone: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
  },
  network: {
    icon: IconWifiOff,
    code: null,
    title: "Немає з'єднання",
    text: "Не вдалося зв'язатися із сервером. Перевірте інтернет і спробуйте ще раз.",
    tone: "bg-muted text-muted-foreground",
  },
  server: {
    icon: IconServerOff,
    code: "500",
    title: "Збій на сервері",
    text: "Сервер не зміг обробити запит. Спробуйте трохи пізніше — якщо повторюється, напишіть нам.",
    tone: "bg-destructive/10 text-destructive",
  },
  outdated: {
    icon: IconSparkles,
    code: null,
    title: "Вийшла нова версія",
    text: "Сайт оновився, поки сторінка була відкрита. Оновіть її, щоб продовжити.",
    tone: "bg-accent text-accent-vivid",
  },
  crash: {
    icon: IconAlertTriangle,
    code: null,
    title: "Щось пішло не так",
    text: "Сталася неочікувана помилка. Оновіть сторінку — зазвичай це допомагає.",
    tone: "bg-destructive/10 text-destructive",
  },
};

export interface ErrorScreenProps {
  kind: ErrorKind;
  title?: string;
  description?: ReactNode;
  error?: unknown;
  onRetry?: () => void;
  backTo?: { to: string; label: string };
  inRouter?: boolean;
  compact?: boolean;
  className?: string;
}

const primaryBtn =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-primary px-5 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";
const secondaryBtn =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-input bg-card px-5 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export default function ErrorScreen({
  kind,
  title,
  description,
  error,
  onRetry,
  backTo = { to: "/", label: "До каталогу" },
  inRouter = true,
  compact = false,
  className,
}: ErrorScreenProps) {
  const content = CONTENT[kind];
  const Icon = content.icon;
  const feedback = useContext(FeedbackDialogContext);

  const canRetry = kind !== "not-found" && kind !== "forbidden";
  const retry = onRetry ?? (() => window.location.reload());
  const retryLabel =
    kind === "outdated" || !onRetry ? "Оновити сторінку" : "Спробувати ще";
  const showDetails = import.meta.env.DEV && error !== undefined;

  const homeLink = inRouter ? (
    <Link to={backTo.to} className={canRetry ? secondaryBtn : primaryBtn}>
      <IconHome className="size-4.5" />
      {backTo.label}
    </Link>
  ) : (
    <a href={backTo.to} className={secondaryBtn}>
      <IconHome className="size-4.5" />
      {backTo.label}
    </a>
  );

  return (
    <section
      role={kind === "crash" || kind === "server" ? "alert" : undefined}
      className={cn(
        "mx-auto flex w-full max-w-140 flex-col items-center px-4 text-center",
        compact ? "gap-3 py-12" : "min-h-[60dvh] justify-center gap-4 py-16",
        className,
      )}
    >
      <div className="relative">
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center rounded-full",
            compact ? "size-16" : "size-24",
            content.tone,
          )}
        >
          <Icon className={compact ? "size-8" : "size-11"} stroke={1.6} />
        </span>
        {content.code && !compact && (
          <span className="absolute -right-3 -bottom-1 rounded-full border-2 border-background bg-card px-2.5 py-0.5 text-xs font-extrabold tracking-wide text-muted-foreground shadow-sm">
            {content.code}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1
          className={cn(
            "font-heading leading-tight font-semibold text-foreground",
            compact ? "text-2xl" : "text-[28px] md:text-4xl",
          )}
        >
          {title ?? content.title}
        </h1>
        <p className="mx-auto max-w-110 text-[15px] leading-relaxed text-muted-foreground md:text-base">
          {description ?? content.text}
        </p>
      </div>

      <div className="mt-2 flex w-full flex-col-reverse gap-2.5 sm:w-auto sm:flex-row sm:justify-center">
        {!canRetry && inRouter && window.history.length > 1 && (
          <button
            type="button"
            onClick={() => window.history.back()}
            className={secondaryBtn}
          >
            <IconArrowLeft className="size-4.5" />
            Назад
          </button>
        )}
        {homeLink}
        {canRetry && (
          <button type="button" onClick={retry} className={primaryBtn}>
            <IconRefresh className="size-4.5" />
            {retryLabel}
          </button>
        )}
      </div>

      {feedback && (kind === "server" || kind === "crash") && (
        <button
          type="button"
          onClick={() => feedback.openFeedback("BUG")}
          className="mt-1 cursor-pointer text-sm font-semibold text-accent-vivid hover:underline"
        >
          Повідомити про проблему
        </button>
      )}

      {showDetails && (
        <details className="mt-4 w-full rounded-xl border border-dashed border-border bg-card p-3 text-left">
          <summary className="cursor-pointer text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Деталі (видно лише в dev-режимі)
          </summary>
          <pre className="mt-2 max-h-60 overflow-auto text-xs leading-relaxed whitespace-pre-wrap text-foreground/80">
            {describeError(error)}
          </pre>
        </details>
      )}
    </section>
  );
}
