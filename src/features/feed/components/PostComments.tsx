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
      className="flex flex-col gap-3.5 border-t border-border/70 bg-[#FBFAF7] px-4 py-4 sm:px-5"
    >
      {isPending ? (
        <div className="flex justify-center py-2">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          Не вдалося завантажити коментарі.
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => refetch()}
          >
            Повторити
          </Button>
        </div>
      ) : (
        <>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="h-8 cursor-pointer self-start text-sm font-bold text-primary hover:underline"
            >
              Показати попередні коментарі ({hiddenCount})
            </button>
          )}
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Коментарів ще немає.{currentUser ? " Напишіть перший." : ""}
            </p>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {visible.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </ul>
          )}
        </>
      )}

      {currentUser ? (
        <CommentForm postId={postId} currentUser={currentUser} />
      ) : isAuthenticated ? null : (
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-bold text-primary hover:underline">
            Увійдіть
          </Link>
          , щоб коментувати.
        </p>
      )}
    </section>
  );
}

function CommentItem({ comment }: { comment: CommentResponse }) {
  return (
    <li className="flex gap-2.5">
      <UserLink
        userId={comment.authorId}
        aria-label={`Профіль: ${comment.authorName}`}
        className="shrink-0 self-start rounded-full"
      >
        <UserAvatar
          name={comment.authorName}
          src={comment.authorAvatarUrl}
          className="h-8.5 w-8.5"
          fallbackClassName="font-sans text-[13px] font-extrabold"
        />
      </UserLink>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="self-start rounded-[4px_14px_14px_14px] bg-[#F1EFE9] px-3 py-2">
          <p className="text-sm font-bold">
            <UserLink
              userId={comment.authorId}
              className="underline-offset-2 hover:underline"
            >
              {comment.authorName}
            </UserLink>
          </p>
          <p className="text-sm leading-normal wrap-break-word whitespace-pre-line text-foreground/90">
            {comment.content}
          </p>
        </div>
        <time
          dateTime={comment.createdAt}
          title={formatFullDate(comment.createdAt)}
          className="pl-3 text-xs text-muted-foreground"
        >
          {formatRelativeTime(comment.createdAt)}
        </time>
      </div>
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
          src={currentUser.avatarUrl}
          className="h-8.5 w-8.5"
          fallbackClassName="font-sans text-[13px] font-extrabold"
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
          className="h-10.5 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
        />
        <button
          type="submit"
          aria-label="Надіслати коментар"
          disabled={!trimmed || isPending}
          className="flex size-10.5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Spinner size={16} />
          ) : (
            <IconSend className="size-4.5" />
          )}
        </button>
      </div>
      {isError && (
        <p role="alert" className="pl-11 text-sm text-destructive">
          {getErrorMessage(error, "Не вдалося надіслати коментар.")}
        </p>
      )}
    </form>
  );
}
