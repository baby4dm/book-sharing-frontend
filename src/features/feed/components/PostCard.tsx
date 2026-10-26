import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconDots,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconTrash,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import type { UserResponse } from "@/features/userProfile/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { PostResponse } from "../types";
import { formatFullDate, pluralizeComments } from "../utils/format";
import DeletePostDialog from "./DeletePostDialog";
import PostComments from "./PostComments";
import UserLink from "@/features/userProfile/components/UserLink";
import { useTogglePostLike } from "../hooks/usePostMutation";
import SmartImage from "@/components/ui/SmartImage";

const COLLAPSE_CHARS = 420;
const COLLAPSE_LINES = 7;

interface PostCardProps {
  post: PostResponse;
  currentUser: UserResponse | null;
  isAuthenticated: boolean;
}

export default function PostCard({
  post,
  currentUser,
  isAuthenticated,
}: PostCardProps) {
  const [likePop, setLikePop] = useState(0);
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const like = useTogglePostLike(post);

  const canDelete =
    !!currentUser &&
    (currentUser.id === post.authorId ||
      currentUser.role === "MODERATOR" ||
      currentUser.role === "ADMIN");

  const isLong =
    post.content.length > COLLAPSE_CHARS ||
    post.content.split("\n").length > COLLAPSE_LINES;

  function handleLike() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (like.isPending) return;
    // сердечко «підстрибує» лише на щойно поставлений лайк
    if (!post.likedByMe) setLikePop((n) => n + 1);
    like.mutate(!post.likedByMe);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-4.5">
        <UserLink
          userId={post.authorId}
          aria-label={`Профіль: ${post.authorName}`}
          className="shrink-0 rounded-full"
        >
          <UserAvatar
            name={post.authorName}
            src={post.authorAvatarUrl}
            className="h-10.5 w-10.5"
            fallbackClassName="font-sans text-base font-extrabold"
          />
        </UserLink>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">
            <UserLink
              userId={post.authorId}
              className="underline-offset-2 hover:underline"
            >
              {post.authorName}
            </UserLink>
          </p>
          <time
            dateTime={post.createdAt}
            title={formatFullDate(post.createdAt)}
            className="text-[13px] text-muted-foreground"
          >
            {formatRelativeTime(post.createdAt)}
          </time>
        </div>

        {canDelete && (
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              aria-label="Дії з постом"
              className="-mr-2 flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <IconDots className="size-5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 gap-0 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
                className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm font-bold text-destructive hover:bg-destructive/10"
              >
                <IconTrash className="size-4.5" />
                Видалити пост
              </button>
            </PopoverContent>
          </Popover>
        )}
      </header>

      <div className="px-4 pt-3 pb-3.5 sm:px-5">
        <p
          className={cn(
            "text-[15px] leading-relaxed wrap-break-word whitespace-pre-line text-foreground/90",
            isLong && !expanded && "line-clamp-6",
          )}
        >
          {post.content}
        </p>
        {isLong && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-1 h-8 cursor-pointer text-sm font-bold text-primary hover:underline"
          >
            Читати далі
          </button>
        )}
      </div>

      {post.photoUrl && !photoFailed && (
        <a
          href={post.photoUrl}
          target="_blank"
          rel="noreferrer"
          className="block bg-muted"
          aria-label="Відкрити фото повністю"
        >
          <SmartImage
            src={post.photoUrl}
            alt={`Фото до поста ${post.authorName}`}
            loading="lazy"
            onError={() => setPhotoFailed(true)}
            className="max-h-140 w-full object-cover"
          />
        </a>
      )}

      <div className="flex items-center gap-1 border-t border-border/70 px-2 py-1.5 sm:px-2.5">
        <button
          type="button"
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? "Прибрати вподобання" : "Вподобати"}
          onClick={handleLike}
          className={cn(
            "flex h-10 cursor-pointer items-center gap-1.75 rounded-[10px] px-3 text-sm transition-[color,background-color,transform] active:scale-95",
            post.likedByMe
              ? "bg-destructive/8 font-bold text-destructive"
              : "font-semibold text-foreground/75 hover:bg-muted",
          )}
        >
          {post.likedByMe ? (
            <IconHeartFilled
              key={likePop}
              className={cn("size-5", likePop > 0 && "animate-like-pop")}
            />
          ) : (
            <IconHeart className="size-5" />
          )}
          {post.likesCount}
        </button>

        <button
          type="button"
          aria-expanded={commentsOpen}
          onClick={() => setCommentsOpen((open) => !open)}
          className={cn(
            "flex h-10 cursor-pointer items-center gap-1.75 rounded-[10px] px-3 text-sm font-semibold text-foreground/75 transition-colors hover:bg-muted",
            commentsOpen && "bg-muted",
          )}
        >
          <IconMessageCircle className="size-5" />
          {post.commentsCount > 0
            ? pluralizeComments(post.commentsCount)
            : "Коментувати"}
        </button>
      </div>

      {commentsOpen && (
        <PostComments
          postId={post.id}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
        />
      )}

      {canDelete && (
        <DeletePostDialog
          postId={post.id}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
    </article>
  );
}
