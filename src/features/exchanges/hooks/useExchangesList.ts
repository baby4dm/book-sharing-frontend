import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getExchanges } from "@/api/exchanges";
import type { ExchangeFilters } from "../types";

export function useExchangesList(filters: ExchangeFilters) {
  return useQuery({
    queryKey: ["currentUserExchanges", "list", filters],
    queryFn: () => getExchanges(filters),
    placeholderData: keepPreviousData,
  });
}
