import { getExchange } from "@/api/exchanges";
import { useQuery } from "@tanstack/react-query";

export function useExchange(id: string) {
  return useQuery({
    queryKey: ["exchange", id],
    queryFn: () => getExchange(id),
  });
}
