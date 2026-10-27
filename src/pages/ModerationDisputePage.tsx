import { useId, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconCheck,
  IconPhotoOff,
  IconStarFilled,
} from "@tabler/icons-react";
import QueryErrorState from "@/components/errors/QueryErrorState";
import BookCardCover from "@/components/layout/BookCardCover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SmartImage from "@/components/ui/SmartImage";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useExchange } from "@/features/exchanges/hooks/useExchange";
import type {
  ExchangeParticipant,
  ExchangePhotoResponse,
} from "@/features/exchanges/types";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import {
  useModerationDispute,
  useResolveDispute,
} from "@/features/moderation/hooks/useModeration";
import {
  DISPUTE_DECISION_LABELS,
  type DisputeDecision,
  type ModerationDispute,
} from "@/features/moderation/types";
import { formatDate, formatDateTime } from "@/features/moderation/utils";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { DELIVERY_METHODS, EXCHANGE_STATUS_CONFIG } from "@/lib/constants";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DECISION_HINTS: Record<DisputeDecision, string> = {
  RESOLVED_FAVOR_FILER:
    "Скаргу підтверджено. Іншу сторону буде обмежено: уперше — на 14 днів, повторно — блокування.",
  RESOLVED_FAVOR_OTHER:
    "Скаргу не підтверджено. Обмін завершиться без наслідків для сторін.",
  DISMISSED: "Скарга безпідставна або не стосується обміну. Обмін завершиться.",
};

const DECISIONS: DisputeDecision[] = [
  "RESOLVED_FAVOR_FILER",
  "RESOLVED_FAVOR_OTHER",
  "DISMISSED",
];

function BackLink() {
  return (
    <Link
      to="/moderation"
      className="-ml-1 inline-flex h-8 w-fit items-center gap-1.5 rounded-md px-1 text-[13px] font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <IconArrowLeft size={16} />
      Скарги
    </Link>
  );
}

function PhotoGroup({
  title,
  photos,
}: {
  title: string;
  photos: ExchangePhotoResponse[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="field-label">
        {title}
        {photos.length > 0 && (
          <span className="tabular font-normal"> · {photos.length}</span>
        )}
      </p>
      {photos.length === 0 ? (
        <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <IconPhotoOff className="size-4" stroke={1.6} />
          Фото немає
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Фото від ${p.uploadedByName}, відкрити повністю`}
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted shadow-[inset_0_0_0_1px_var(--border)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <SmartImage
                src={p.url}
                alt=""
                className="size-full object-cover transition-[scale] duration-300 ease-(--ease-out) group-hover:scale-[1.04]"
              />
              <span className="absolute inset-x-1 bottom-1 truncate rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {p.uploadedByName}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function PartyRow({
  participant,
  role,
  isFiler,
}: {
  participant: ExchangeParticipant;
  role: string;
  isFiler: boolean;
}) {
  return (
    <Link
      to={`/moderation/users/${participant.id}`}
      className="group flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
    >
      <UserAvatar
        name={participant.name}
        src={participant.avatarUrl}
        seed={participant.id}
        className="size-10"
        fallbackClassName="text-sm"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="flex items-center gap-2 text-sm">
          <span className="truncate font-semibold">{participant.name}</span>
          {isFiler && (
            <span className="shrink-0 rounded-md bg-tint-amber px-1.5 py-0.5 text-[11px] font-semibold text-tint-amber-ink">
              Заявник
            </span>
          )}
        </p>
        <p className="tabular flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
          <span>{role}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <IconStarFilled className="size-3 text-star" />
            {Number(participant.ratingAvg ?? 0).toFixed(1)}
          </span>
          <span>·</span>
          <span>
            Віддано {participant.booksGiven} · Взято {participant.booksTaken}
          </span>
          {participant.booksOverdue > 0 && (
            <span className="text-tint-amber-ink">
              · Прострочено {participant.booksOverdue}
            </span>
          )}
        </p>
      </div>
      <IconArrowUpRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
      />
    </Link>
  );
}

function ResolveForm({ dispute }: { dispute: ModerationDispute }) {
  const id = useId();
  const [decision, setDecision] = useState<DisputeDecision | null>(null);
  const [comment, setComment] = useState("");
  const [touched, setTouched] = useState(false);
  const resolve = useResolveDispute(dispute.id);

  const commentMissing = touched && comment.trim().length === 0;
  const decisionMissing = touched && decision === null;

  function submit() {
    setTouched(true);
    if (!decision || !comment.trim()) return;
    resolve.mutate({ status: decision, resolutionComment: comment.trim() });
  }

  return (
    <section
      className="surface flex flex-col gap-4 p-5"
      aria-labelledby={`${id}-title`}
    >
      <div>
        <h2 id={`${id}-title`} className="section-title">
          Рішення
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Обидві сторони отримають сповіщення з вашим поясненням.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Рішення по скарзі"
        className="flex flex-col gap-2"
      >
        {DECISIONS.map((d) => {
          const active = decision === d;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setDecision(d)}
              className={cn(
                "flex cursor-pointer gap-3 rounded-lg border p-3 text-left transition-[background-color,border-color,box-shadow] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active
                  ? "border-ring/50 bg-accent shadow-[0_0_0_1px_var(--ring)]"
                  : "border-input bg-card hover:border-border-strong hover:bg-muted",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active ? "border-primary bg-primary" : "border-input bg-card",
                )}
              >
                <AnimatePresence>
                  {active && (
                    <motion.span
                      initial={{ transform: "scale(0.4)", opacity: 0 }}
                      animate={{ transform: "scale(1)", opacity: 1 }}
                      exit={{ transform: "scale(0.4)", opacity: 0 }}
                      transition={{ duration: 0.15, ease: EASE_OUT }}
                      className="size-1.5 rounded-full bg-primary-foreground"
                    />
                  )}
                </AnimatePresence>
              </span>
              <span className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    active && "text-accent-foreground",
                  )}
                >
                  {DISPUTE_DECISION_LABELS[d]}
                </span>
                <span className="text-[13px] leading-relaxed text-muted-foreground">
                  {DECISION_HINTS[d]}
                </span>
              </span>
            </button>
          );
        })}
        {decisionMissing && (
          <p className="text-xs text-destructive">Оберіть рішення</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-comment`} required>
          Пояснення для сторін
        </Label>
        <Textarea
          id={`${id}-comment`}
          value={comment}
          maxLength={4000}
          onChange={(e) => setComment(e.target.value)}
          aria-invalid={commentMissing || undefined}
          placeholder="На чому ґрунтується рішення: фото, листування, терміни"
          className="min-h-28"
        />
        {commentMissing && (
          <p className="text-xs text-destructive">Поясніть рішення</p>
        )}
      </div>

      {resolve.isError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-tint-red px-3.5 py-2.5 text-sm text-tint-red-ink"
        >
          {getErrorMessage(resolve.error, "Не вдалося зберегти рішення.")}
        </p>
      )}

      <Button size="lg" disabled={resolve.isPending} onClick={submit}>
        {resolve.isPending ? "Зберігаємо…" : "Ухвалити рішення"}
      </Button>
    </section>
  );
}

function ResolvedCard({ dispute }: { dispute: ModerationDispute }) {
  return (
    <motion.section
      initial={{ opacity: 0, transform: "translateY(6px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="surface flex flex-col gap-3 p-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <IconCheck className="size-3.5" stroke={3} />
        </span>
        <h2 className="section-title">
          {DISPUTE_DECISION_LABELS[dispute.status as DisputeDecision]}
        </h2>
      </div>
      {dispute.resolutionComment && (
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {dispute.resolutionComment}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {dispute.moderatorName ?? "Модератор"} ·{" "}
        {formatDateTime(dispute.resolvedAt)}
      </p>
    </motion.section>
  );
}

function DisputeBody({ dispute }: { dispute: ModerationDispute }) {
  const exchange = useExchange(dispute.exchangeId);
  const exchangeStatus = EXCHANGE_STATUS_CONFIG[dispute.exchangeStatus];
  const deadline = exchange.data?.extendedDeadline ?? exchange.data?.deadline;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-5">
        <section className="surface flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="section-title">Скарга</h2>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(dispute.createdAt)}
            </p>
          </div>
          <p className="text-[15px] leading-relaxed whitespace-pre-line">
            {dispute.description}
          </p>
          <p className="text-[13px] text-muted-foreground">
            Подав(-ла) {dispute.filedByName} —{" "}
            {dispute.filedByOwner ? "власник книги" : "читач"}
          </p>
        </section>

        <section className="surface flex flex-col gap-5 p-5">
          <h2 className="section-title">Фото стану книги</h2>
          {exchange.isPending ? (
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : exchange.isError ? (
            <p className="text-sm text-muted-foreground">
              Не вдалося завантажити фото обміну.
            </p>
          ) : (
            <>
              <PhotoGroup
                title="Під час передачі"
                photos={exchange.data.handoverPhotos}
              />
              <PhotoGroup
                title="Перед поверненням"
                photos={exchange.data.returnPhotos}
              />
              <PhotoGroup
                title="Додані до скарги"
                photos={exchange.data.disputePhotos}
              />
            </>
          )}
        </section>
      </div>

      <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24">
        <section className="surface flex flex-col gap-2 p-5">
          <h2 className="section-title mb-1">Сторони</h2>
          <PartyRow
            participant={dispute.owner}
            role="Власник"
            isFiler={dispute.filedByOwner}
          />
          <PartyRow
            participant={dispute.reader}
            role="Читач"
            isFiler={!dispute.filedByOwner}
          />
        </section>

        <section className="surface p-5">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
            <dt className="field-label">Статус обміну</dt>
            <dd>{exchangeStatus?.label ?? dispute.exchangeStatus}</dd>
            <dt className="field-label">Спосіб</dt>
            <dd>{DELIVERY_METHODS[dispute.deliveryMethod]}</dd>
            <dt className="field-label">Термін</dt>
            <dd>{deadline ? formatDate(deadline) : "—"}</dd>
          </dl>
        </section>

        {dispute.status === "OPEN" ? (
          <ResolveForm dispute={dispute} />
        ) : (
          <ResolvedCard dispute={dispute} />
        )}
      </div>
    </div>
  );
}

export default function ModerationDisputePage() {
  const { id } = useParams<{ id: string }>();
  const { data: dispute, isPending, error, refetch } = useModerationDispute(id);

  if (isPending) {
    return (
      <section
        aria-busy="true"
        className="mx-auto flex w-full max-w-295 flex-col gap-6 px-4 pt-6 pb-16 md:px-8 lg:pt-8"
      >
        <Skeleton className="h-5 w-20" />
        <div className="flex gap-4">
          <Skeleton className="h-[104px] w-[72px] rounded-md" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </section>
    );
  }

  if (error || !dispute) {
    return (
      <QueryErrorState
        error={error}
        onRetry={() => refetch()}
        notFoundTitle="Скаргу не знайдено"
        notFoundText="Можливо, посилання застаріло."
        backTo={{ to: "/moderation", label: "До скарг" }}
      />
    );
  }

  const open = dispute.status === "OPEN";

  return (
    <section className="mx-auto flex w-full max-w-295 flex-col gap-6 px-4 pt-6 pb-16 md:px-8 lg:pt-8">
      <BackLink />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <BookCardCover
          src={dispute.bookCoverUrl}
          className="sm:h-[120px] sm:w-[84px]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                open
                  ? "bg-tint-red text-tint-red-ink"
                  : "bg-tint-neutral text-tint-neutral-ink",
              )}
            >
              {open ? "Очікує рішення" : "Розглянуто"}
            </span>
          </div>
          <h1 className="book-title text-[22px] leading-tight wrap-break-word md:text-[28px]">
            {dispute.bookTitle}
          </h1>
          {dispute.bookAuthor && (
            <p className="text-sm text-muted-foreground">
              {dispute.bookAuthor}
            </p>
          )}
        </div>
        <Link
          to={`/exchanges/${dispute.exchangeId}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "w-fit",
          })}
        >
          Сторінка обміну
          <IconArrowUpRight />
        </Link>
      </header>

      <DisputeBody dispute={dispute} />
    </section>
  );
}
