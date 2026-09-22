import { getSentRequests } from "@/api/requests";
import { useQuery } from "@tanstack/react-query";

export function useSentRequests() {
  return useQuery({
    queryKey: ["myRequests"],
    queryFn: getSentRequests,
  });
}
