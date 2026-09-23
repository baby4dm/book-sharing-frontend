import ProfileEditingForm from "@/features/userProfile/components/ProfileEditingForm";
import ProfileView from "@/features/userProfile/components/ProfileView";
import { useState } from "react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="w-full p-4 flex justify-center md:px-8">
      {isEditing && <ProfileEditingForm />}
      {!isEditing && <ProfileView />}
    </section>
  );
}
