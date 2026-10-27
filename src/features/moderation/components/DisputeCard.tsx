import { Link } from "react-router-dom";
import { IconArrowRight } from "@tabler/icons-react";
import BookCardCover from "@/components/layout/BookCardCover";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DISPUTE_DECISION_LABELS, type ModerationDispute } from "../types";

/** Скарга в списку: книга, хто на кого скаржиться, суть і давність */
export default function DisputeCard({
  dispute,
}: {
  dispute: ModerationDispute;
}) {
  const against = dispute.filedByOwner ? dispute.reader : dispute.owner;
  const open = dispute.status === "OPEN";

  return (
    <article className="group surface surface-interactive relative flex flex-col gap-4 p-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring sm:flex-row md:gap-5">
      <BookCardCover src={dispute.bookCoverUrl} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="book-title text-lg leading-tight">
            <Link
              to={`/moderation/disputes/${dispute.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-['']"
            >
              {dispute.bookTitle}
            </Link>
          </h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
              open
                ? "bg-tint-red text-tint-red-ink"
                : "bg-tint-neutral text-tint-neutral-ink",
            )}
          >
            {open
              ? "Очікує рішення"
              : DISPUTE_DECISION_LABELS[
                  dispute.status as keyof typeof DISPUTE_DECISION_LABELS
                ]}
          </span>
        </div>
        <p className="text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {dispute.filedByName}
          </span>
          {dispute.filedByOwner ? " (власник)" : " (читач)"} скаржиться на{" "}
          <span className="font-semibold text-foreground">{against.name}</span>
          {" · "}
          {formatRelativeTime(
            open
              ? dispute.createdAt
              : (dispute.resolvedAt ?? dispute.createdAt),
          )}
        </p>
        <p className="line-clamp-2 text-sm leading-relaxed text-foreground">
          «{dispute.description}»
        </p>
        {!open && dispute.moderatorName && (
          <p className="text-xs text-muted-foreground">
            Розглянув(-ла): {dispute.moderatorName}
          </p>
        )}
      </div>
      <IconArrowRight
        aria-hidden="true"
        className="hidden size-4 shrink-0 self-center text-muted-foreground transition-[translate,color] duration-150 group-hover:translate-x-0.5 group-hover:text-foreground sm:block"
      />
    </article>
  );
}
