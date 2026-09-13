import { getCities } from "@/api/listings";
import { useQuery } from "@tanstack/react-query";

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: 5 * 60 * 100,
  });
}
