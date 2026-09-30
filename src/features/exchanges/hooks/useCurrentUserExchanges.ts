import { useQuery } from "@tanstack/react-query";
import { getCurrentUserExchanges } from "@/api/exchanges";

export function useCurrentUserExchanges() {
  return useQuery({
    queryKey: ["currentUserExchanges"],
    queryFn: getCurrentUserExchanges,
  });
}
