import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import { IconAlertTriangle, IconMessageCircle } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { listItemMotion } from "@/lib/motion";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/features/feed/components/PostCard";
import PostComposer from "@/features/feed/components/PostComposer";
import { isModeratorRole } from "@/features/moderation/types";
import { useFeed } from "@/features/feed/hooks/useFeed";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { flattenFeed } from "@/features/feed/utils/feedCache";

function PostSkeleton() {
  return (
    <div aria-hidden="true" className="surface flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const { data: me, isPending: isMePending } = useCurrentUserProfile();
  const currentUser = isAuthenticated ? (me ?? null) : null;

  const {
    data,
    isPending,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useFeed();
  const posts = flattenFeed(data);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchNextPageError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  return (
    <section className="mx-auto flex w-full max-w-170 flex-col gap-3 px-4 pt-6 pb-20 sm:gap-4 sm:px-6 lg:pt-8">
      <div className="mb-2">
        <h1 className="page-title">Спільнота</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isModeratorRole(currentUser?.role)
            ? "Перегляд для модерації: видаляйте дописи й коментарі, що порушують правила"
            : "Що читають люди на сервісі та що про це думають"}
        </p>
      </div>

      {isAuthenticated && isMePending ? (
        <Skeleton className="h-18.5 rounded-xl" />
      ) : isModeratorRole(currentUser?.role) ? null : (
        <PostComposer currentUser={currentUser} />
      )}

      {isPending ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : !data ? (
        <EmptyState
          framed
          icon={IconAlertTriangle}
          title="Не вдалося завантажити стрічку"
          description="Перевірте з'єднання і спробуйте ще раз."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Спробувати ще раз
            </Button>
          }
        />
      ) : posts.length === 0 ? (
        <EmptyState
          framed
          icon={IconMessageCircle}
          title="Почніть розмову"
          description="Розкажіть, що читаєте зараз, — ваш пост буде першим у стрічці."
        />
      ) : (
        <div className="contents">
          <AnimatePresence initial={false} mode="popLayout">
            {posts.map((post) => (
              <motion.div key={post.id} layout {...listItemMotion}>
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  isAuthenticated={isAuthenticated}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={sentinelRef} />
          {isFetchingNextPage && (
            <div
              role="status"
              className="flex items-center justify-center gap-2.5 py-3 text-sm text-muted-foreground"
            >
              <Spinner size={18} />
              Завантажуємо ще пости…
            </div>
          )}
          {isFetchNextPageError && (
            <div className="flex items-center justify-center gap-3 py-3 text-sm text-muted-foreground">
              Не вдалося завантажити наступні пости.
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
              >
                Повторити
              </Button>
            </div>
          )}
          {!hasNextPage && posts.length > 3 && (
            <p className="py-3 text-center text-sm text-muted-foreground">
              Ви переглянули всі пости
            </p>
          )}
        </div>
      )}
    </section>
  );
}
