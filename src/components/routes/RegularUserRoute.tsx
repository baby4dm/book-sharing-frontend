import { Navigate, Outlet } from "react-router-dom";
import { useIsModerator } from "@/features/moderation/hooks/useModeration";

export default function RegularUserRoute() {
  const { isModerator } = useIsModerator();

  if (isModerator) {
    return <Navigate to="/moderation" replace />;
  }

  return <Outlet />;
}
