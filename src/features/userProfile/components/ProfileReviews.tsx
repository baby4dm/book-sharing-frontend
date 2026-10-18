import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import type { UserReview } from "../types";
import { useUserReviews } from "../hooks/useUserReviews";
import UserAvatar from "./UserAvatar";

interface ProfileReviewsProps {
  userId: string;
}

function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div
      role="img"
      aria-label={`${rating} з 5`}
      className="text-[15px] tracking-[1px]"
    >
      <span className="text-[#D99A1E]">{"★".repeat(rating)}</span>
      <span className="text-[#C9C4BA]">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

function ReviewItem({ review }: { review: UserReview }) {
  return (
    <li className="flex gap-3.5 border-t border-border/70 pt-4">
      <UserAvatar
        name={review.authorName}
        src={review.authorAvatarUrl}
        className="h-10 w-10 bg-[#F3E4D6]"
        fallbackClassName="font-sans text-base font-extrabold text-[#8A4B00]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5">
          <p className="min-w-0 font-bold">
            {review.authorName}{" "}
            <span className="font-medium text-muted-foreground">
              · «{review.bookTitle}»
            </span>
          </p>
          <time
            dateTime={review.createdAt}
            className="text-[13px] text-muted-foreground"
          >
            {formatReviewDate(review.createdAt)}
          </time>
        </div>
        <ReviewStars rating={review.rating} />
        {review.comment && (
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-line text-foreground/80">
            {review.comment}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {review.authorRole === "OWNER" ? "Власник книги" : "Читач"}
        </p>
      </div>
    </li>
  );
}

export default function ProfileReviews({ userId }: ProfileReviewsProps) {
  const {
    data,
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useUserReviews(userId);

  const reviews = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-semibold md:text-[22px]">
          Відгуки
        </h2>
        {total > 0 && (
          <span className="text-sm font-semibold text-muted-foreground">
            {total}
          </span>
        )}
      </div>

      {isPending ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Не вдалося завантажити відгуки.
          </p>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => refetch()}
          >
            Спробувати ще раз
          </Button>
        </div>
      ) : reviews.length === 0 ? (
        <p className="border-t border-border/70 pt-4 text-sm text-muted-foreground">
          Поки що відгуків немає. Вони з'являться після завершених обмінів.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </ul>
          {hasNextPage && (
            <Button
              variant="outline"
              className="h-10 cursor-pointer self-center rounded-[10px] px-5 font-semibold"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Завантаження..." : "Показати ще"}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
