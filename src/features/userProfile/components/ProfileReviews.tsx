import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import type { UserReview } from "../types";
import { useUserReviews } from "../hooks/useUserReviews";
import UserAvatar from "./UserAvatar";
import UserLink from "./UserLink";
import {
  IconAlertTriangle,
  IconMessageStar,
  IconStarFilled,
} from "@tabler/icons-react";

interface ProfileReviewsProps {
  userId: string;
  emptyText?: string;
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
    <div role="img" aria-label={`${rating} з 5`} className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <IconStarFilled
          key={i}
          aria-hidden="true"
          className={i < rating ? "size-4 text-star" : "size-4 text-border"}
        />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: UserReview }) {
  return (
    <li className="flex gap-3.5 border-t border-border pt-4">
      <UserLink
        userId={review.authorId}
        aria-label={`Профіль: ${review.authorName}`}
        className="shrink-0 self-start rounded-full"
      >
        <UserAvatar
          name={review.authorName}
          src={review.authorAvatarUrl}
          seed={review.authorId}
          className="size-10"
          fallbackClassName="text-base"
        />
      </UserLink>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5">
          <p className="min-w-0 text-sm font-semibold">
            <UserLink
              userId={review.authorId}
              className="hover:underline underline-offset-2"
            >
              {review.authorName}
            </UserLink>{" "}
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
          <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-line text-foreground">
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

export default function ProfileReviews({
  userId,
  emptyText,
}: ProfileReviewsProps) {
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
    <section className="flex flex-col gap-4 surface p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-title">Відгуки</h2>
        {total > 0 && (
          <span className="tabular text-[13px] font-medium text-muted-foreground">
            {total}
          </span>
        )}
      </div>

      {isPending ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3.5 border-t border-border pt-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          className="py-6"
          icon={IconAlertTriangle}
          title="Не вдалося завантажити відгуки"
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Спробувати ще раз
            </Button>
          }
        />
      ) : reviews.length === 0 ? (
        <EmptyState
          className="border-t border-border py-8"
          icon={IconMessageStar}
          title="Відгуків поки немає"
          description={
            emptyText ?? "Вони з'являються після завершених обмінів."
          }
        />
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
              className="self-center"
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
