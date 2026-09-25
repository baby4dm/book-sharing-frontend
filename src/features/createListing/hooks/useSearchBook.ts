import { useMutation } from "@tanstack/react-query";
import { searchBook } from "@/api/createListing";

export function useSearchBook() {
  return useMutation({ mutationFn: (query: string) => searchBook(query) });
}
