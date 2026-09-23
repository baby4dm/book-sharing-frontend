import { useState } from "react";
import type { UserResponse } from "../types";
import { Button } from "@/components/ui/button";

interface ProfileViewProps {
  userData: UserResponse;
}

export default function ProfileView({ userData }: ProfileViewProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  return (
    <div>
      <div className="relative w-11 h-11 rounded-full overflow-hidden bg-primary flex items-center justify-center lg:w-13 lg:h-13">
        {userData.avatarUrl && !avatarFailed ? (
          <img
            src={userData.avatarUrl}
            alt={userData.name}
            className="w-full h-full object-cover"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <p className="text-primary-foreground text-sm font-semibold">
            {userData.name.substring(0, 1).toUpperCase()}
          </p>
        )}
      </div>
      <div>
        <div>
            <div>
                <h1>{userData.name}</h1>
                <p>{userData}</p>
            </div>
            <Button variant="outline">Редагувати профіль</Button>
        </div>
        <p>{userData.bio || 'Люблю фантастику і детективи. Завжди рада обмінятись книгою або порадити щось цікаве!'}</p>
      </div>
    </div>
  );
}
