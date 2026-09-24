import { getCurrentUser } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProfile() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["currentProfile"],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
  });
}
