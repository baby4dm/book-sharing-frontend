import { useState } from "react";
import { IconCheck, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDayMonth } from "@/lib/utils";
import type {
  CreateReviewPayload,
  ExchangeParticipant,
  ExchangeResponse,
  ExchangeReviewResponse,
} from "../types";
import { getErrorMessage } from "../utils/getErrorMessage";

const RATING_LABELS = [
  "",
  "Погано",
  "Так собі",
  "Нормально",
  "Добре",
  "Чудово",
];
const MAX_COMMENT_LENGTH = 1000;
const STAR_COLOR = "text-[#D99A1E]";

interface ExchangeReviewSectionProps {
  exchange: ExchangeResponse;
  currentUserId: string;
  onSubmit: (payload: CreateReviewPayload) => Promise<unknown>;
}

export default function ExchangeReviewSection({
  exchange,
  currentUserId,
  onSubmit,
}: ExchangeReviewSectionProps) {
  if (exchange.status !== "COMPLETED") return null;

  const isOwner = exchange.ownerId === currentUserId;
  const partner = isOwner ? exchange.reader : exchange.owner;
  const myReview =
    (exchange.reviews ?? []).find((r) => r.authorId === currentUserId) ?? null;

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3 text-accent-foreground">
        <IconCheck size={20} stroke={2.4} className="shrink-0" />
        <p className="text-[15px]">
          <strong>Обмін завершено.</strong>
          {exchange.completedAt &&
            ` Книга повернулась до власника ${formatDayMonth(exchange.completedAt)}.`}
        </p>
      </div>

      {myReview ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-extrabold">Ваш відгук</h2>
          <ReviewItem review={myReview} title={`Ви про ${partner.name}`} />
        </div>
      ) : (
        <ReviewForm
          partner={partner}
          bookTitle={exchange.bookTitle}
          onSubmit={onSubmit}
        />
      )}
    </section>
  );
}

function ReviewForm({
  partner,
  bookTitle,
  onSubmit,
}: {
  partner: ExchangeParticipant;
  bookTitle: string;
  onSubmit: (payload: CreateReviewPayload) => Promise<unknown>;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shown = hovered || rating;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Оберіть оцінку від 1 до 5");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ rating, comment: comment.trim() || null });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <h2 className="font-heading text-xl font-semibold">
          Як пройшов обмін?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          «{bookTitle}» · користувач {partner.name}. Відгук побачать інші
          учасники спільноти.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Оцінка</legend>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} з 5`}
              aria-pressed={rating === n}
              onClick={() => {
                setRating(n);
                setError(null);
              }}
              onMouseEnter={() => setHovered(n)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <IconStarFilled
                size={32}
                className={cn(
                  "transition-colors",
                  n <= shown ? STAR_COLOR : "text-input",
                )}
              />
            </button>
          ))}
          <span className="ml-2 min-w-20 font-bold">
            {RATING_LABELS[shown]}
          </span>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-comment" className="text-sm font-semibold">
          Коментар{" "}
          <span className="font-normal text-muted-foreground">
            (необов'язково)
          </span>
        </Label>
        <Textarea
          id="review-comment"
          rows={4}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Стан книги, швидкість відповіді, чи дотримались домовленостей"
          className="resize-none rounded-lg border-input px-3.5 py-3 text-[15px] leading-relaxed"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full cursor-pointer rounded-lg font-bold sm:w-fit sm:px-8"
      >
        {isSubmitting ? "Надсилання..." : "Надіслати відгук"}
      </Button>
    </form>
  );
}

function ReviewItem({
  review,
  title,
}: {
  review: ExchangeReviewResponse;
  title: string;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-bold text-accent-foreground">
          {review.authorAvatarUrl && !avatarFailed ? (
            <img
              src={review.authorAvatarUrl}
              alt=""
              className="size-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            review.authorName.substring(0, 1).toUpperCase()
          )}
        </div>
        <span className="flex-1 text-[15px] font-semibold">{title}</span>
        <span role="img" aria-label={`${review.rating} з 5`} className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <IconStarFilled
              key={n}
              size={15}
              className={n <= review.rating ? STAR_COLOR : "text-input"}
            />
          ))}
        </span>
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {review.comment}
        </p>
      )}
    </div>
  );
}
