import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/features/feed/components/PostCard";
import PostComposer from "@/features/feed/components/PostComposer";
import { useFeed } from "@/features/feed/hooks/useFeed";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { flattenFeed } from "@/features/feed/utils/feedCache";

function PostSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse flex-col gap-3 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-3">
        <div className="size-10.5 rounded-full bg-muted" />
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-36 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="h-3.5 w-full rounded bg-muted" />
      <div className="h-3.5 w-4/5 rounded bg-muted" />
      <div className="h-48 rounded-xl bg-muted" />
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
    <section className="mx-auto flex w-full max-w-170 flex-col gap-4 px-3 pt-5 pb-20 sm:px-6 md:pt-8">
      <div className="mb-1 px-1 sm:px-0">
        <h1 className="font-heading text-[28px] leading-tight font-semibold md:text-4xl">
          Спільнота
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:text-[15px]">
          Що читають люди на сервісі та що про це думають
        </p>
      </div>

      {isAuthenticated && isMePending ? (
        <div className="h-21 animate-pulse rounded-2xl border border-border bg-card" />
      ) : (
        <PostComposer currentUser={currentUser} />
      )}

      {isPending ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : !data ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="font-heading text-lg font-semibold">
            Не вдалося завантажити стрічку
          </p>
          <p className="text-sm text-muted-foreground">
            Перевірте з'єднання та спробуйте ще раз.
          </p>
          <Button className="mt-1 cursor-pointer" onClick={() => refetch()}>
            Спробувати ще раз
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-input bg-card/60 p-10 text-center">
          <p className="font-heading text-lg font-semibold">
            Тут поки порожньо
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Розкажіть, що читаєте зараз, — ваш пост буде першим.
          </p>
        </div>
      ) : (
        <div className="stagger-in contents">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
            />
          ))}

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
                className="cursor-pointer"
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
