import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import QueryErrorState from "@/components/errors/QueryErrorState";
import ProfileEditingForm from "@/features/userProfile/components/ProfileEditingForm";
import ProfileReviews from "@/features/userProfile/components/ProfileReviews";
import ProfileStats from "@/features/userProfile/components/ProfileStats";
import ProfileView from "@/features/userProfile/components/ProfileView";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { useUserReviews } from "@/features/userProfile/hooks/useUserReviews";

export default function ProfilePage() {
  const { data, isPending, isError, error, refetch } = useCurrentUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const { data: reviewsData } = useUserReviews(data?.id);

  if (isPending) {
    return (
      <section className="flex w-full justify-center py-24">
        <Spinner size={28} />
      </section>
    );
  }

  if (isError) {
    return <QueryErrorState error={error} onRetry={() => refetch()} />;
  }

  if (isEditing) {
    return (
      <section className="flex w-full justify-center px-4 pt-6 pb-20 md:px-6 md:pt-8">
        <ProfileEditingForm userData={data} onEditing={setIsEditing} />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-295 flex-col items-start gap-4 px-4 pt-6 pb-20 md:gap-6 md:px-8 md:pt-8 lg:flex-row lg:px-12">
      <ProfileView userData={data} onEditing={setIsEditing} />

      <div className="flex w-full min-w-0 flex-1 flex-col gap-4 md:gap-6">
        <ProfileStats
          userData={data}
          reviewsCount={reviewsData?.pages[0]?.totalElements}
        />
        <ProfileReviews userId={data.id} />
      </div>
    </section>
  );
}
