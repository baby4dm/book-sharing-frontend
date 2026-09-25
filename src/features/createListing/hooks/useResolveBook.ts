import { useMutation } from "@tanstack/react-query";
import { resolveBook } from "@/api/createListing";

export function useResolveBook() {
  return useMutation({
    mutationFn: resolveBook,
  });
}
