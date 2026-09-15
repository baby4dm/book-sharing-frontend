import { getListing } from "@/api/listings";
import { useQuery } from "@tanstack/react-query";

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => getListing(id),
  });
}
