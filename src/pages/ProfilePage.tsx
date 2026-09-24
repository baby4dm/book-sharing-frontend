import ProfileEditingForm from "@/features/userProfile/components/ProfileEditingForm";
import ProfileView from "@/features/userProfile/components/ProfileView";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import { useState } from "react";

export default function ProfilePage() {
  const { data, isPending, isError, error } = useCurrentUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (isError) {
    return;
  }
  if (isPending) {
    return;
  }
  return (
    <section className="w-full py-4 px-3 flex justify-center md:px-8 md:py-6">
      {isEditing && (
        <ProfileEditingForm userData={data} onEditing={setIsEditing} />
      )}
      {!isEditing && <ProfileView userData={data} onEditing={setIsEditing} />}
    </section>
  );
}
