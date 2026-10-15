import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRequests } from "@/api/requests";
import type { RequestFilters, RequestScope } from "../types";

export function useRequestsList(scope: RequestScope, filters: RequestFilters) {
  return useQuery({
    // фільтри в ключі: змінився будь-який фільтр або сторінка, значить новий запит
    queryKey: ["requests", scope, filters],
    queryFn: () => getRequests(scope, filters),
    // поки вантажиться нова сторінка, лишається попередня (без миготіння)
    placeholderData: keepPreviousData,
  });
}
