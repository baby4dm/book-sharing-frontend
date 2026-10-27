import UserAvatar from "@/features/userProfile/components/UserAvatar";
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
import RequiredMark from "@/components/ui/RequiredMark";

const RATING_LABELS = [
  "",
  "Погано",
  "Так собі",
  "Нормально",
  "Добре",
  "Чудово",
];
const MAX_COMMENT_LENGTH = 1000;
const STAR_COLOR = "text-star";

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
  const reviews = exchange.reviews ?? [];
  const myReview = reviews.find((r) => r.authorId === currentUserId) ?? null;
  const reviewAboutMe = reviews.find((r) => r.authorId === partner.id) ?? null;

  return (
    <section className="flex flex-col gap-5 surface p-5 md:p-6">
      <div className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3 text-accent-foreground">
        <IconCheck size={20} stroke={2.4} className="shrink-0" />
        <p className="text-[15px]">
          <strong>Обмін завершено.</strong>
          {exchange.completedAt &&
            ` Книга повернулась до власника ${formatDayMonth(exchange.completedAt)}.`}
        </p>
      </div>

      {!myReview && (
        <ReviewForm
          partner={partner}
          bookTitle={exchange.bookTitle}
          onSubmit={onSubmit}
        />
      )}

      {(myReview || reviewAboutMe) && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold">Відгуки</h2>
          {myReview && (
            <ReviewItem review={myReview} title={`Ви про ${partner.name}`} />
          )}
          {reviewAboutMe && (
            <ReviewItem
              review={reviewAboutMe}
              title={`${partner.name} про вас`}
            />
          )}
        </div>
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
        <h2 className="text-lg font-bold">
          Як пройшов обмін?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          «{bookTitle}» · користувач {partner.name}. Відгук побачать інші
          учасники спільноти.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Оцінка <RequiredMark /></legend>
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
        className="h-10 w-full rounded-lg font-semibold sm:w-fit sm:px-8"
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

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2.5">
        <UserAvatar name={review.authorName} src={review.authorAvatarUrl} seed={review.authorId} className="size-8" fallbackClassName="text-xs" />
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
