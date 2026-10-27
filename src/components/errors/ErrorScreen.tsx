import { buttonVariants } from "@/components/ui/button";
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
    tone: "text-muted-foreground",
  },
  forbidden: {
    icon: IconLock,
    code: "403",
    title: "Немає доступу",
    text: "Ця сторінка доступна лише учасникам або модераторам. Перевірте, чи ви увійшли в потрібний акаунт.",
    tone: "text-muted-foreground",
  },
  network: {
    icon: IconWifiOff,
    code: null,
    title: "Немає з'єднання",
    text: "Не вдалося зв'язатися із сервером. Перевірте інтернет і спробуйте ще раз.",
    tone: "text-muted-foreground",
  },
  server: {
    icon: IconServerOff,
    code: "500",
    title: "Збій на сервері",
    text: "Сервер не зміг обробити запит. Спробуйте трохи пізніше — якщо повторюється, напишіть нам.",
    tone: "text-destructive",
  },
  outdated: {
    icon: IconSparkles,
    code: null,
    title: "Вийшла нова версія",
    text: "Сайт оновився, поки сторінка була відкрита. Оновіть її, щоб продовжити.",
    tone: "text-muted-foreground",
  },
  crash: {
    icon: IconAlertTriangle,
    code: null,
    title: "Щось пішло не так",
    text: "Сталася неочікувана помилка. Оновіть сторінку — зазвичай це допомагає.",
    tone: "text-destructive",
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

const primaryBtn = buttonVariants({ size: "lg" });
const secondaryBtn = buttonVariants({ variant: "outline", size: "lg" });

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
            "flex items-center justify-center rounded-xl border border-border bg-card shadow-xs",
            compact ? "size-12" : "size-16",
            content.tone,
          )}
        >
          <Icon className={compact ? "size-6" : "size-7"} stroke={1.6} />
        </span>
        {content.code && !compact && (
          <span className="tabular absolute -right-4 -bottom-2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground shadow-xs">
            {content.code}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1
          className={cn(
            "leading-tight font-bold tracking-[-0.02em] text-foreground",
            compact ? "text-xl" : "text-2xl md:text-[28px]",
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
          className="mt-1 cursor-pointer text-sm font-semibold text-primary hover:underline"
        >
          Повідомити про проблему
        </button>
      )}

      {showDetails && (
        <details className="mt-4 w-full rounded-xl border border-dashed border-border bg-card p-3 text-left">
          <summary className="cursor-pointer field-label">
            Деталі (видно лише в dev-режимі)
          </summary>
          <pre className="mt-2 max-h-60 overflow-auto text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {describeError(error)}
          </pre>
        </details>
      )}
    </section>
  );
}
