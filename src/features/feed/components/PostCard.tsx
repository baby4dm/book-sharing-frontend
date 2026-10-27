import { AnimatePresence, motion } from "motion/react";
import { springPop } from "@/lib/motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconDots,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconShieldX,
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
import ReasonDialog from "@/features/moderation/components/ReasonDialog";
import { useModerateDeletePost } from "@/features/moderation/hooks/useModeration";
import { isModeratorRole } from "@/features/moderation/types";
import PostComments from "./PostComments";
import UserLink from "@/features/userProfile/components/UserLink";
import { useTogglePostLike } from "../hooks/usePostMutation";
import SmartImage from "@/components/ui/SmartImage";
import Collapse from "@/components/ui/collapse";

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

  const isAuthor = !!currentUser && currentUser.id === post.authorId;
  // модератор видаляє чужий пост лише з причиною — автор отримає сповіщення
  const moderatesPost = !isAuthor && isModeratorRole(currentUser?.role);
  const canDelete = isAuthor || moderatesPost;
  const [moderateOpen, setModerateOpen] = useState(false);
  const moderateDelete = useModerateDeletePost();

  const isLong =
    post.content.length > COLLAPSE_CHARS ||
    post.content.split("\n").length > COLLAPSE_LINES;

  function handleLike() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (like.isPending) return;
    if (!post.likedByMe) setLikePop((n) => n + 1);
    like.mutate(!post.likedByMe);
  }

  return (
    <article className="surface overflow-hidden">
      <header className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-4.5">
        <UserLink
          userId={post.authorId}
          aria-label={`Профіль: ${post.authorName}`}
          className="shrink-0 rounded-full"
        >
          <UserAvatar
            name={post.authorName}
            seed={post.authorId}
            src={post.authorAvatarUrl}
            className="size-10"
            fallbackClassName="text-sm"
          />
        </UserLink>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
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
            className="text-xs text-muted-foreground"
          >
            {formatRelativeTime(post.createdAt)}
          </time>
        </div>

        {canDelete && (
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              aria-label="Дії з постом"
              className="-mr-1.5 flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-popup-open:bg-muted"
            >
              <IconDots className="size-5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 gap-0 p-1">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (moderatesPost) setModerateOpen(true);
                  else setDeleteOpen(true);
                }}
                className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-destructive transition-colors outline-none hover:bg-tint-red focus-visible:bg-tint-red"
              >
                {moderatesPost ? (
                  <IconShieldX className="size-4" />
                ) : (
                  <IconTrash className="size-4" />
                )}
                {moderatesPost ? "Видалити як модератор" : "Видалити пост"}
              </button>
            </PopoverContent>
          </Popover>
        )}
      </header>

      <div className="px-4 pt-3 pb-3.5 sm:px-5">
        <p
          className={cn(
            "text-[15px] leading-relaxed wrap-break-word whitespace-pre-line text-foreground",
            isLong && !expanded && "line-clamp-6",
          )}
        >
          {post.content}
        </p>
        {isLong && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-1 h-8 cursor-pointer rounded-sm text-sm font-semibold text-primary hover:underline"
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
            className="max-h-105 w-full object-cover"
          />
        </a>
      )}

      <div className="flex items-center gap-1 border-t border-border px-2 py-1.5 sm:px-2.5">
        <button
          type="button"
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? "Прибрати вподобання" : "Вподобати"}
          onClick={handleLike}
          className={cn(
            "flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold transition-[color,background-color,scale] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95",
            post.likedByMe
              ? "text-destructive hover:bg-tint-red"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <motion.span
            key={post.likedByMe ? `on-${likePop}` : "off"}
            initial={
              post.likedByMe && likePop > 0
                ? { transform: "scale(0.6)" }
                : false
            }
            animate={{ transform: "scale(1)" }}
            transition={springPop}
            className="flex"
          >
            {post.likedByMe ? (
              <IconHeartFilled className="size-4.5" />
            ) : (
              <IconHeart className="size-4.5" stroke={1.75} />
            )}
          </motion.span>
          <span className="tabular">{post.likesCount}</span>
        </button>

        <button
          type="button"
          aria-expanded={commentsOpen}
          onClick={() => setCommentsOpen((open) => !open)}
          className={cn(
            "flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out outline-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95",
            commentsOpen && "bg-muted text-foreground",
          )}
        >
          <IconMessageCircle className="size-4.5" stroke={1.75} />
          {post.commentsCount > 0
            ? pluralizeComments(post.commentsCount)
            : "Коментувати"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {commentsOpen && (
          <Collapse>
            <PostComments
              postId={post.id}
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
            />
          </Collapse>
        )}
      </AnimatePresence>

      {isAuthor && (
        <DeletePostDialog
          postId={post.id}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
      {moderatesPost && (
        <ReasonDialog
          open={moderateOpen}
          onOpenChange={setModerateOpen}
          title="Видалити пост?"
          description={`Пост ${post.authorName} разом із коментарями буде видалено назавжди. Автор отримає сповіщення з причиною.`}
          confirmLabel="Видалити"
          quickReasons={[
            "Образи або мова ворожнечі",
            "Спам або реклама",
            "Не стосується книг і читання",
            "Особисті дані інших людей",
          ]}
          onConfirm={(reason) =>
            moderateDelete.mutateAsync({ id: post.id, reason })
          }
        />
      )}
    </article>
  );
}
