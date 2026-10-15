import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRequests } from "@/api/requests";
import type { RequestFilters, RequestScope } from "../types";

export function useRequestsList(scope: RequestScope, filters: RequestFilters) {
  return useQuery({
    queryKey: ["requests", scope, filters],
    queryFn: () => getRequests(scope, filters),
    placeholderData: keepPreviousData,
  });
}
