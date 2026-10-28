import ReasonDialog from "@/features/moderation/components/ReasonDialog";
import { useModerateDeleteComment } from "@/features/moderation/hooks/useModeration";
import { isModeratorRole } from "@/features/moderation/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Link } from "react-router-dom";
import { IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import type { UserResponse } from "@/features/userProfile/types";
import { formatRelativeTime } from "@/lib/utils";
import { useCreateComment, usePostComments } from "../hooks/usePostComments";
import { COMMENT_MAX_LENGTH, type CommentResponse } from "../types";
import { formatFullDate } from "../utils/format";
import UserLink from "@/features/userProfile/components/UserLink";

const VISIBLE_BY_DEFAULT = 3;

interface PostCommentsProps {
  postId: string;
  currentUser: UserResponse | null;
  isAuthenticated: boolean;
}

export default function PostComments({
  postId,
  currentUser,
  isAuthenticated,
}: PostCommentsProps) {
  const [showAll, setShowAll] = useState(false);
  const isStaff = isModeratorRole(currentUser?.role);
  const {
    data: comments,
    isPending,
    isError,
    refetch,
  } = usePostComments(postId, true);

  const hiddenCount =
    comments && !showAll
      ? Math.max(0, comments.length - VISIBLE_BY_DEFAULT)
      : 0;
  const visible = comments ? comments.slice(hiddenCount) : [];

  return (
    <section
      aria-label="Коментарі"
      className="flex flex-col gap-3.5 border-t border-border bg-background px-4 py-4 sm:px-5"
    >
      {isPending ? (
        <div aria-busy="true" className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-2.5">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-12 w-3/5 rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          Не вдалося завантажити коментарі.
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Повторити
          </Button>
        </div>
      ) : (
        <>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="h-8 cursor-pointer self-start rounded-sm text-[13px] font-semibold text-primary hover:underline"
            >
              Показати попередні коментарі ({hiddenCount})
            </button>
          )}
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Коментарів ще немає.
              {currentUser && !isStaff ? " Напишіть перший." : ""}
            </p>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {visible.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  canModerate={isStaff && currentUser?.id !== comment.authorId}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {isStaff ? null : currentUser ? (
        <CommentForm postId={postId} currentUser={currentUser} />
      ) : isAuthenticated ? null : (
        <p className="text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Увійдіть
          </Link>
          , щоб коментувати.
        </p>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  postId,
  canModerate,
}: {
  comment: CommentResponse;
  postId: string;
  canModerate: boolean;
}) {
  const [moderateOpen, setModerateOpen] = useState(false);
  const moderateDelete = useModerateDeleteComment(postId);
  return (
    <li className="group/comment flex gap-2.5">
      <UserLink
        userId={comment.authorId}
        aria-label={`Профіль: ${comment.authorName}`}
        className="shrink-0 self-start rounded-full"
      >
        <UserAvatar
          name={comment.authorName}
          seed={comment.authorId}
          src={comment.authorAvatarUrl}
          className="size-8"
          fallbackClassName="font-sans text-[13px] font-bold"
        />
      </UserLink>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="self-start rounded-[4px_12px_12px_12px] border border-border bg-card px-3 py-2">
          <p className="text-[13px] font-semibold">
            <UserLink
              userId={comment.authorId}
              className="underline-offset-2 hover:underline"
            >
              {comment.authorName}
            </UserLink>
          </p>
          <p className="text-sm leading-normal wrap-break-word whitespace-pre-line text-foreground">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center gap-3 pl-3">
          <time
            dateTime={comment.createdAt}
            title={formatFullDate(comment.createdAt)}
            className="text-xs text-muted-foreground"
          >
            {formatRelativeTime(comment.createdAt)}
          </time>
          {canModerate && (
            <button
              type="button"
              onClick={() => setModerateOpen(true)}
              className="cursor-pointer rounded-sm text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Видалити
            </button>
          )}
        </div>
      </div>
      {canModerate && (
        <ReasonDialog
          open={moderateOpen}
          onOpenChange={setModerateOpen}
          title="Видалити коментар?"
          description={`Коментар ${comment.authorName} буде видалено. Автор отримає сповіщення з причиною.`}
          confirmLabel="Видалити"
          quickReasons={[
            "Образи або мова ворожнечі",
            "Спам або реклама",
            "Не стосується теми",
          ]}
          onConfirm={(reason) =>
            moderateDelete.mutateAsync({ id: comment.id, reason })
          }
        />
      )}
    </li>
  );
}

function CommentForm({
  postId,
  currentUser,
}: {
  postId: string;
  currentUser: UserResponse;
}) {
  const [content, setContent] = useState("");
  const { mutate, isPending, isError, error } = useCreateComment(postId);
  const trimmed = content.trim();
  const inputId = `comment-${postId}`;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!trimmed || isPending) return;
    mutate(trimmed, { onSuccess: () => setContent("") });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <UserAvatar
          name={currentUser.name}
          seed={currentUser.id}
          src={currentUser.avatarUrl}
          className="size-8"
          fallbackClassName="font-sans text-[13px] font-bold"
        />
        <label htmlFor={inputId} className="sr-only">
          Ваш коментар
        </label>
        <input
          id={inputId}
          type="text"
          value={content}
          maxLength={COMMENT_MAX_LENGTH}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Написати коментар…"
          autoComplete="off"
          className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-card px-3 text-sm shadow-xs transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15"
        />
        <button
          type="submit"
          aria-label="Надіслати коментар"
          disabled={!trimmed || isPending}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--highlight-fill),var(--shadow-xs)] transition-[background-color,scale,opacity] duration-150 ease-out outline-none hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
        >
          {isPending ? <Spinner size={16} /> : <IconSend className="size-4" />}
        </button>
      </div>
      {isError && (
        <p role="alert" className="pl-10.5 text-[13px] text-destructive">
          {getErrorMessage(error, "Не вдалося надіслати коментар.")}
        </p>
      )}
    </form>
  );
}
