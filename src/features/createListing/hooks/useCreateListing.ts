import { createListing } from "@/api/createListing";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createListing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings"] }),
  });
}
