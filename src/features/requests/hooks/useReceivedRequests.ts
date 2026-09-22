import { getReceivedRequests } from "@/api/requests";
import { useQuery } from "@tanstack/react-query";

export function useReceivedRequests() {
  return useQuery({
    queryKey: ["receivedRequests"],
    queryFn: getReceivedRequests,
  });
}
