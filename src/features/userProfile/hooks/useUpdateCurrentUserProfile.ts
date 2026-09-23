import { updateCurrentUser } from "@/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCurrentUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["currentProfile"] }),
  });
}
