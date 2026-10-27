import { buttonVariants } from "@/components/ui/button";
import { Link, Navigate, useParams } from "react-router-dom";
import { IconMessageCircle } from "@tabler/icons-react";
import ProfileSkeleton from "@/features/userProfile/components/ProfileSkeleton";
import QueryErrorState from "@/components/errors/QueryErrorState";
import ProfileReviews from "@/features/userProfile/components/ProfileReviews";
import ProfileStats from "@/features/userProfile/components/ProfileStats";
import ProfileView from "@/features/userProfile/components/ProfileView";
import UserShelf from "@/features/userProfile/components/UserShelf";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { useUserProfile } from "@/features/userProfile/hooks/useUserProfile";
import { useUserReviews } from "@/features/userProfile/hooks/useUserReviews";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: me } = useCurrentUserProfile();
  const { data: user, isPending, error, refetch } = useUserProfile(id);
  const { data: reviewsData } = useUserReviews(id);

  if (me && me.id === id) {
    return <Navigate to="/profile" replace />;
  }

  if (isPending) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    return (
      <QueryErrorState
        error={error}
        onRetry={() => refetch()}
        notFoundTitle="Користувача не знайдено"
        notFoundText="Можливо, акаунт видалено або посилання застаріло."
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-295 flex-col items-start gap-4 px-4 pt-6 pb-20 md:gap-6 md:px-8 lg:flex-row lg:px-12 lg:pt-8">
      <ProfileView
        userData={user}
        actions={
          me && (
            <Link
              to={`/chat?user=${user.id}`}
              className={buttonVariants({ className: "w-full" })}
            >
              <IconMessageCircle />
              Написати
            </Link>
          )
        }
      />

      <div className="flex w-full min-w-0 flex-1 flex-col gap-4 md:gap-6">
        <ProfileStats
          userData={user}
          reviewsCount={reviewsData?.pages[0]?.totalElements}
        />
        <UserShelf userId={user.id} />
        <ProfileReviews
          userId={user.id}
          emptyText="Вони з'являються, коли обмін із цією людиною завершено."
        />
      </div>
    </section>
  );
}
