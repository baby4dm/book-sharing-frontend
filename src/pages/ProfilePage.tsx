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
  if(isPending) {
    return
  }
  return (
    <section className="w-full p-4 flex justify-center md:px-8">
      {isEditing && <ProfileEditingForm />}
      {!isEditing && <ProfileView userData={data} />}
    </section>
  );
}
